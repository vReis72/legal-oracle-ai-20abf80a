
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
      const isPdf = file.name.toLowerCase().endsWith('.pdf');
      
      // Verificar o tamanho do arquivo - limitar a 2MB normalmente, mas permitir PDFs um pouco maiores
      const maxSize = isPdf ? 3 * 1024 * 1024 : 2 * 1024 * 1024;
      if (file.size > maxSize) {
        toast({
          variant: "destructive",
          title: "Arquivo muito grande",
          description: isPdf 
            ? "Por favor, selecione um PDF menor que 3MB para análise."
            : "Por favor, selecione um arquivo menor que 2MB para análise.",
        });
        return;
      }
      
      setUploading(true);
      
      // Simulação de progresso de upload mais realista
      const simulateUpload = () => {
        let progress = 0;
        const interval = setInterval(() => {
          // Progresso mais lento para PDFs para dar impressão de processamento mais complexo
          const increment = isPdf ? 3 : 5;
          progress += increment;
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
        
        // Tempo limite maior para PDFs
        const timeout = isPdf ? 60000 : 45000;
        const timeoutPromise = createTimeoutPromise(timeout);
        
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
            description: isPdf && analysis.keyPoints?.some(kp => kp.title.includes("Aviso"))
              ? "O PDF foi analisado, mas com algumas limitações na extração de texto."
              : "O documento foi analisado com sucesso.",
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
          description: isPdf
            ? "Erro ao processar o PDF. Verifique se o arquivo não está corrompido ou protegido."
            : error instanceof Error 
              ? `Erro: ${error.message}` 
              : "Ocorreu um erro inesperado durante o processamento.",
        });
        
        // Atualizar o documento que falhou
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
    
    // Para arquivos PDF, tentamos como texto primeiro, mas podemos precisar 
    // de tratamento especial no futuro se necessário
    reader.readAsText(file);
  });
};

const createTimeoutPromise = (timeout: number): Promise<never> => {
  return new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error("Tempo limite excedido")), timeout);
  });
};
