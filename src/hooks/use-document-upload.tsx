
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { processDocument, determineDocumentType } from '@/services/documentService';
import { Document } from '@/types/document';
import { useApiKey } from '@/context/ApiKeyContext';

export const useDocumentUpload = (
  documents: Document[], 
  setDocuments: React.Dispatch<React.SetStateAction<Document[]>>,
  setSelectedDocument: React.Dispatch<React.SetStateAction<Document | null>>
) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();
  const { isKeyConfigured } = useApiKey();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isKeyConfigured) {
      toast({
        variant: "destructive",
        title: "API Key não configurada",
        description: "Configure sua chave da API OpenAI antes de fazer upload de documentos.",
      });
      return;
    }

    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Verificar o tamanho do arquivo - limitar a 2MB para evitar problemas
      if (file.size > 2 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "Arquivo muito grande",
          description: "Por favor, selecione um arquivo menor que 2MB para análise rápida.",
        });
        return;
      }
      
      setUploading(true);
      
      // Simulação de progresso de upload mais realista
      const simulateUpload = () => {
        let progress = 0;
        const interval = setInterval(() => {
          progress += 5;
          setUploadProgress(Math.min(progress, 99)); // Não chega a 100% até o processamento terminar
          
          if (progress >= 99) {
            clearInterval(interval);
          }
        }, 100);
        return interval;
      };
      
      const uploadInterval = simulateUpload();
      
      // Criar novo documento fora do try-catch para que esteja disponível no escopo do catch
      const documentType = determineDocumentType(file.name);
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
      
      try {
        // Ler o conteúdo do arquivo
        const fileContent = await readFileContent(file);
        
        // Processar o documento com timeout limitado
        const timeoutPromise = createTimeoutPromise(25000);
        
        const analysisPromise = processDocument(fileContent, file.name, documentType);
        
        // Race para garantir que não ficará processando indefinidamente
        const analysis = await Promise.race([analysisPromise, timeoutPromise])
          .catch(error => {
            console.error("Erro ou timeout no processamento:", error);
            
            // Notificar usuário do erro
            toast({
              variant: "destructive",
              title: "Erro no processamento",
              description: "O processamento do documento demorou muito. Tente um arquivo menor ou em formato texto.",
            });
            
            // Retorna uma análise parcial
            return {
              summary: "O processamento excedeu o tempo limite. Tente um documento menor.",
              highlights: [],
              keyPoints: [{ 
                title: "Processamento interrompido", 
                description: "O documento pode ser muito grande ou complexo para análise." 
              }],
              content: fileContent.substring(0, 500) + "\n\n[Conteúdo truncado]"
            };
          });
        
        // Atualizar documento com resultados
        clearInterval(uploadInterval);
        setUploadProgress(100);
        
        // Pequeno delay antes de mostrar como concluído
        setTimeout(() => {
          setDocuments(prev => prev.map(doc => 
            doc.id === newDocument.id 
              ? {
                  ...doc,
                  processed: true,
                  content: analysis.content,
                  summary: analysis.summary,
                  highlights: analysis.highlights,
                  keyPoints: analysis.keyPoints
                } 
              : doc
          ));
          
          toast({
            title: "Documento processado",
            description: "O documento foi analisado com sucesso.",
          });
          
          setUploading(false);
        }, 500);
        
      } catch (error) {
        clearInterval(uploadInterval);
        console.error('Erro no processamento:', error);
        
        // Notificar usuário do erro
        toast({
          variant: "destructive",
          title: "Falha no processamento",
          description: error instanceof Error 
            ? `Erro: ${error.message}` 
            : "Ocorreu um erro inesperado durante o processamento.",
        });
        
        // Remover o documento que falhou
        setDocuments(prev => prev.filter(doc => doc.id !== newDocument.id));
        
        setUploading(false);
        setUploadProgress(0);
      }
    }
  };

  return {
    uploading,
    uploadProgress,
    handleFileUpload
  };
};

// Utility functions
const readFileContent = (file: File): Promise<string> => {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        resolve(event.target.result as string);
      } else {
        reject(new Error("Falha ao ler o arquivo"));
      }
    };
    reader.onerror = () => reject(new Error("Erro ao ler o arquivo"));
    reader.readAsText(file);
  });
};

const createTimeoutPromise = (timeout: number): Promise<never> => {
  return new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error("Tempo limite excedido")), timeout);
  });
};
