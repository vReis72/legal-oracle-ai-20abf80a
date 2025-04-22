
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Document } from '@/types/document';
import { processDocument, determineDocumentType } from '@/services/documentService';
import { readFileContent, createTimeoutPromise } from './use-file-reader';
import { useUploadProgress } from './use-upload-progress';
import { useDocumentValidation } from './use-document-validation';

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
  const { toast } = useToast();
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
    
    // Configurar um timeout de segurança geral - nunca deixar o processamento preso por mais de 3 minutos
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
    }, 180000); // 3 minutos no máximo
    
    setProcessingTimeout(timeout);
    
    try {
      // Ler o conteúdo do arquivo - com timeout aumentado
      const fileContent = await Promise.race([
        readFileContent(file),
        createTimeoutPromise(isPdf ? 90000 : 45000) // 90 segundos para PDFs, 45 para outros
      ]);
      
      // Tempo limite maior para PDFs
      const analysisTimeout = isPdf ? 120000 : 60000;
      const timeoutPromise = createTimeoutPromise(analysisTimeout);
      
      const analysisPromise = processDocument(fileContent, file.name, documentType);
      
      // Race para garantir que não ficará processando indefinidamente
      const analysis = await Promise.race([analysisPromise, timeoutPromise])
        .catch(error => {
          console.error("Erro ou timeout no processamento:", error);
          
          // Notificar usuário do erro
          toast({
            variant: "destructive",
            title: "Erro no processamento",
            description: isPdf
              ? "Houve problemas ao processar o PDF. Verifique se o documento contém texto selecionável."
              : "O processamento do documento demorou muito. Tente um arquivo menor ou em formato texto.",
          });
          
          // Retorna uma análise parcial com mensagem adequada ao tipo de arquivo
          return {
            summary: isPdf 
              ? "Não foi possível processar este PDF completamente. O arquivo pode estar protegido ou o texto não estar em formato extraível."
              : "O processamento excedeu o tempo limite. Tente um documento menor ou em formato texto puro (.txt).",
            highlights: [],
            keyPoints: [{ 
              title: isPdf ? "PDF com problemas" : "Processamento interrompido", 
              description: isPdf
                ? "O PDF pode estar protegido ou ter sido digitalizado como imagem, dificultando a extração do texto."
                : "O documento pode ser muito grande ou complexo para análise." 
            }],
            content: fileContent.substring(0, 1000) + "\n\n[Conteúdo truncado]"
          };
        });
      
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
        description: isPdf && analysis.keyPoints?.some(kp => kp.title?.includes("Aviso") || kp.title?.includes("PDF com problemas"))
          ? "O PDF foi analisado, mas com algumas limitações na extração de texto."
          : "O documento foi analisado com sucesso.",
      });
      
    } catch (error) {
      // Limpar o timeout de segurança
      if (processingTimeout) {
        clearTimeout(processingTimeout);
        setProcessingTimeout(null);
      }
      
      clearInterval(uploadInterval);
      console.error('Erro no processamento:', error);
      
      // Notificar usuário do erro
      toast({
        variant: "destructive",
        title: "Falha no processamento",
        description: isPdf
          ? "Erro ao processar o PDF. Verifique se o arquivo não está corrompido ou protegido."
          : error instanceof Error 
            ? `Erro: ${error.message}` 
            : "Ocorreu um erro inesperado durante o processamento.",
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
                description: isPdf
                  ? "O PDF pode estar protegido ou em formato que dificulta a extração de texto."
                  : "Ocorreu um erro ao tentar processar este documento."
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
