
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Document } from '@/types/document';
import { processDocument, determineDocumentType } from '@/services/documentService';
import { readFileContent, createTimeoutPromise } from './use-file-reader';
import { useUploadProgress } from './use-upload-progress';
import { useDocumentValidation } from './use-document-validation';

// Cache para o toast para evitar múltiplas instâncias
let toastCache: ReturnType<typeof useToast> | null = null;

/**
 * Hook para processamento de documentos
 * @param documents Lista de documentos
 * @param setDocuments Função para atualizar a lista de documentos
 * @param setSelectedDocument Função para atualizar o documento selecionado
 * @returns Funções e estados para processamento de documentos
 */
export const useDocumentProcessor = (
  documents: Document[],
  setDocuments: React.Dispatch<React.SetStateAction<Document[]>>,
  setSelectedDocument: React.Dispatch<React.SetStateAction<Document | null>>,
  isKeyConfigured: boolean
) => {
  // Usamos uma única instância do hook useToast para evitar problemas com hooks
  if (!toastCache) {
    toastCache = useToast();
  }
  const { toast } = toastCache;
  
  const { uploading, uploadProgress, simulateUploadProgress, completeUpload, cancelUpload, getStatusMessage } = useUploadProgress();
  const { validateFileSize, validateApiKey } = useDocumentValidation();
  const [processingTimeout, setProcessingTimeout] = useState<NodeJS.Timeout | null>(null);

  // Limpar timeouts ao desmontar o componente
  useEffect(() => {
    return () => {
      if (processingTimeout) clearTimeout(processingTimeout);
    };
  }, [processingTimeout]);

  /**
   * Processa um arquivo enviado pelo usuário
   * @param file Arquivo a ser processado
   */
  const processFile = async (file: File) => {
    // Validação do tamanho do arquivo apenas
    if (!validateFileSize(file)) {
      return;
    }
    
    // Validação da chave API
    if (!validateApiKey(isKeyConfigured)) {
      return;
    }
    
    const isPdf = file.name.toLowerCase().endsWith('.pdf');
    const documentType = determineDocumentType(file.name);
    
    // Iniciar progresso de upload
    const uploadInterval = simulateUploadProgress(isPdf);
    
    // Criar novo documento e adicioná-lo à lista
    const newDocument: Document = {
      id: Date.now().toString(),
      name: file.name,
      type: documentType,
      uploadDate: new Date(),
      processed: false
    };
    
    // Adicionar documento à lista imediatamente
    setDocuments(prev => [newDocument, ...prev]);
    setSelectedDocument(newDocument);
    
    // Configurar um timeout de segurança geral - reduzido para 45 segundos
    const timeout = setTimeout(() => {
      console.log("Timeout de segurança global acionado");
      
      // Garantir que o upload seja finalizado
      clearInterval(uploadInterval);
      completeUpload();
      
      // Marcar documento como processado com mensagem de erro
      setDocuments(prev => prev.map(doc => 
        doc.id === newDocument.id 
          ? {
              ...doc,
              processed: true,
              summary: "O processamento do documento demorou muito e foi interrompido.",
              content: "O tempo limite para processamento foi excedido. Tente novamente com um documento menor ou em formato texto.",
              highlights: [],
              keyPoints: [{
                title: "Erro no processamento",
                description: "O tempo limite para análise foi excedido."
              }]
            } 
          : doc
      ));
      
      toast({
        variant: "destructive",
        title: "Tempo limite excedido",
        description: "O processamento do documento demorou muito. Tente novamente com um documento menor.",
      });
    }, 45000); // Reduzido para 45 segundos
    
    setProcessingTimeout(timeout);
    
    try {
      // Ler o conteúdo do arquivo com timeout reduzido
      let fileContent;
      try {
        fileContent = await Promise.race([
          readFileContent(file),
          createTimeoutPromise(isPdf ? 30000 : 20000) // Reduzido para 30/20 segundos
        ]);
      } catch (error) {
        console.error("Erro ou timeout na leitura do arquivo:", error);
        
        // Garantir que o upload seja finalizado
        clearInterval(uploadInterval);
        completeUpload();
        
        // Marcar documento como processado com erro
        setDocuments(prev => prev.map(doc => 
          doc.id === newDocument.id 
            ? {
                ...doc,
                processed: true,
                summary: "Não foi possível ler o conteúdo do documento.",
                content: "O arquivo pode estar corrompido, protegido ou em um formato não suportado.",
                highlights: [],
                keyPoints: [{
                  title: "Erro na leitura",
                  description: "Não foi possível extrair texto do documento."
                }]
              } 
            : doc
        ));
        
        // Limpar o timeout
        if (processingTimeout) {
          clearTimeout(processingTimeout);
          setProcessingTimeout(null);
        }
        
        // Notificar usuário
        toast({
          variant: "destructive",
          title: "Erro na leitura",
          description: isPdf
            ? "Não foi possível ler o conteúdo do PDF. O arquivo pode estar protegido ou danificado."
            : "Não foi possível ler o conteúdo do arquivo."
        });
        
        return;
      }
      
      // NOVO: Verificação de conteúdo nulo ou muito pequeno
      if (!fileContent || fileContent.trim().length < 50) {
        console.log("Conteúdo do arquivo muito pequeno ou vazio");
        
        clearInterval(uploadInterval);
        completeUpload();
        
        // Atualizar o documento com erro
        setDocuments(prev => prev.map(doc => 
          doc.id === newDocument.id 
            ? {
                ...doc,
                processed: true,
                summary: "Documento vazio ou com conteúdo mínimo",
                content: fileContent || "Sem conteúdo",
                highlights: [],
                keyPoints: [{
                  title: "Documento vazio",
                  description: isPdf
                    ? "O PDF não contém texto extraível. Pode ser uma digitalização sem OCR."
                    : "O arquivo não contém texto suficiente para análise."
                }]
              } 
            : doc
        ));
        
        // Limpar o timeout
        if (processingTimeout) {
          clearTimeout(processingTimeout);
          setProcessingTimeout(null);
        }
        
        toast({
          // Mudando de "warning" para "default" para corresponder aos tipos permitidos
          variant: "default",
          title: "Documento sem conteúdo",
          description: isPdf 
            ? "O PDF parece não conter texto extraível. Verifique se é uma digitalização sem OCR."
            : "O arquivo contém muito pouco texto para análise."
        });
        
        return;
      }
      
      // Limitar o tamanho do conteúdo para evitar problemas de processamento
      const limitedContent = fileContent.length > 10000
        ? fileContent.substring(0, 10000)
        : fileContent;
      
      // Processar o documento limitado
      try {
        const analysis = await processDocument(limitedContent, file.name, documentType);
        
        // Limpar o timeout de segurança
        if (processingTimeout) {
          clearTimeout(processingTimeout);
          setProcessingTimeout(null);
        }
        
        // Garantir que o intervalo seja limpo e o upload finalizado
        clearInterval(uploadInterval);
        completeUpload();
        
        // Atualizar o documento com os resultados da análise
        setDocuments(prev => prev.map(doc => 
          doc.id === newDocument.id 
            ? {
                ...doc,
                processed: true,
                content: analysis.content || "Conteúdo não disponível",
                summary: analysis.summary || "Resumo não disponível",
                highlights: analysis.highlights || [],
                keyPoints: analysis.keyPoints || []
              } 
            : doc
        ));
        
        toast({
          title: "Documento processado",
          description: isPdf && (analysis.summary?.includes("PDF") || analysis.keyPoints?.some(kp => kp.title?.includes("PDF")))
            ? "O PDF foi analisado, mas com algumas limitações na extração de texto."
            : "O documento foi analisado com sucesso.",
        });
      } catch (error) {
        console.error("Erro no processamento:", error);
        
        // Garantir que o upload seja finalizado
        clearInterval(uploadInterval);
        completeUpload();
        
        // Marcar documento como processado com erro genérico
        setDocuments(prev => prev.map(doc => 
          doc.id === newDocument.id 
            ? {
                ...doc,
                processed: true,
                summary: "Erro durante a análise do documento",
                content: limitedContent.substring(0, 1000) + "\n\n[Conteúdo truncado devido a erro]",
                highlights: [],
                keyPoints: [{
                  title: "Erro na análise",
                  description: "Ocorreu um erro ao analisar o documento. Tente novamente."
                }]
              } 
            : doc
        ));
        
        // Limpar o timeout
        if (processingTimeout) {
          clearTimeout(processingTimeout);
          setProcessingTimeout(null);
        }
        
        toast({
          variant: "destructive",
          title: "Erro na análise",
          description: "Não foi possível completar a análise do documento.",
        });
      }
    } catch (error) {
      // Limpar o timeout de segurança
      if (processingTimeout) {
        clearTimeout(processingTimeout);
        setProcessingTimeout(null);
      }
      
      clearInterval(uploadInterval);
      console.error('Erro geral no processamento:', error);
      
      // Notificar usuário do erro
      toast({
        variant: "destructive",
        title: "Falha no processamento",
        description: "Ocorreu um erro inesperado durante o processamento do documento.",
      });
      
      // Atualizar o documento que falhou - IMPORTANTE: marcar como processado para sair do estado de loading
      setDocuments(prev => prev.map(doc => 
        doc.id === newDocument.id 
          ? {
              ...doc,
              processed: true,
              summary: "Erro ao processar o documento",
              content: "Não foi possível processar o conteúdo deste documento.",
              highlights: [],
              keyPoints: [{
                title: "Erro no processamento",
                description: "Ocorreu um erro inesperado. Tente novamente com outro documento."
              }]
            } 
          : doc
      ));
      
      // É importante garantir que o upload seja cancelado corretamente
      cancelUpload();
    }
  };

  /**
   * Manipula o evento de upload de arquivo
   */
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      processFile(file);
    }
  };

  return {
    uploading,
    uploadProgress,
    handleFileUpload,
    getStatusMessage
  };
};
