
import { Document } from '@/types/document';
import { determineDocumentType, determineFileFormat } from '@/services/document/documentTypeDetector';
import { readFileContent, createTimeoutPromise } from '@/services/document/fileReader';
import { processAndChunkContent, analyzeDocumentChunks, combineChunkAnalysis } from '@/services/document/documentProcessor';
import { useDocumentValidation } from './use-document-validation';
import { useProcessingTimeout } from './use-processing-timeout';

interface UseProcessFileProps {
  setDocuments: React.Dispatch<React.SetStateAction<Document[]>>;
  setSelectedDocument: React.Dispatch<React.SetStateAction<Document | null>>;
  toast: ReturnType<typeof import('@/hooks/use-toast').useToast>['toast'];
  upload: ReturnType<typeof import('./use-upload-progress').useUploadProgress>;
  isKeyConfigured: boolean;
  setStatusMessage: React.Dispatch<React.SetStateAction<string>>;
}

/**
 * Hook especializado no processamento de arquivos
 */
export const useProcessFile = ({
  setDocuments,
  setSelectedDocument,
  toast,
  upload,
  isKeyConfigured,
  setStatusMessage
}: UseProcessFileProps) => {
  const { validateFileSize, validateApiKey } = useDocumentValidation();
  const { setOrReplaceTimeout, clear: clearTimeout } = useProcessingTimeout();

  /**
   * Manipula erro na leitura do arquivo
   */
  const handleFileReadError = (
    document: Document,
    error: Error
  ) => {
    clearTimeout();
    upload.completeUpload();

    setDocuments(prev => prev.map(doc =>
      doc.id === document.id
        ? {
            ...doc,
            processed: true,
            summary: `Erro ao ler o arquivo: ${error.message}`,
            content: "Não foi possível ler o conteúdo do arquivo.",
            highlights: [],
            keyPoints: [{
              title: "Erro na leitura",
              description: "O arquivo pode estar corrompido ou em um formato não suportado."
            }]
          }
        : doc
    ));

    toast({
      variant: "destructive",
      title: "Erro ao processar documento",
      description: `Não foi possível ler o arquivo: ${error.message}`,
    });
  };

  /**
   * Manipula erro no processamento do arquivo
   */
  const handleProcessError = (
    document: Document,
    error: Error,
    fileContent?: string
  ) => {
    clearTimeout();
    upload.completeUpload();

    const errorMessage = error.message || "Erro desconhecido no processamento";

    setDocuments(prev => prev.map(doc =>
      doc.id === document.id
        ? {
            ...doc,
            processed: true,
            summary: `Erro no processamento: ${errorMessage}`,
            content: fileContent ? `Conteúdo parcial: ${fileContent.substring(0, 500)}...` : "Conteúdo não disponível",
            highlights: [],
            keyPoints: [{
              title: "Erro de processamento",
              description: errorMessage
            }]
          }
        : doc
    ));

    toast({
      variant: "destructive",
      title: "Erro ao analisar documento",
      description: errorMessage,
    });
  };

  /**
   * Atualiza o documento com o resultado da análise
   */
  const updateDocumentWithAnalysis = (
    document: Document,
    analysis: any
  ) => {
    setDocuments(prev => prev.map(doc =>
      doc.id === document.id
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
      variant: "default",
      title: "Documento processado",
      description: analysis.summary?.includes("[Aviso") || analysis.keyPoints?.some((kp: any) => kp.title?.includes("Aviso"))
        ? "O documento foi analisado, mas com algumas limitações."
        : "O documento foi analisado com sucesso.",
    });
  };

  /**
   * Configura um timeout de segurança para o processamento
   */
  const setupProcessingTimeout = (
    document: Document,
    uploadInterval: number
  ) => {
    setOrReplaceTimeout(() => {
      console.log('Timeout de segurança acionado');
      clearInterval(uploadInterval);
      upload.completeUpload();
      
      setDocuments(prev => prev.map(doc =>
        doc.id === document.id
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
    }, 45000);
  };

  /**
   * Processa o arquivo submetido pelo usuário
   */
  const processFile = async (file: File) => {
    if (!validateFileSize(file)) return;
    if (!validateApiKey(isKeyConfigured)) return;

    const fileFormat = determineFileFormat(file.name);
    const documentType = determineDocumentType(file.name);
    const uploadInterval = upload.simulateUploadProgress(fileFormat === 'pdf');

    const newDocument: Document = {
      id: Date.now().toString(),
      name: file.name,
      type: documentType,
      uploadDate: new Date(),
      processed: false
    };

    setDocuments(prev => [newDocument, ...prev]);
    setSelectedDocument(newDocument);
    
    // Configura timeout de segurança
    setupProcessingTimeout(newDocument, uploadInterval);

    try {
      setStatusMessage("Lendo conteúdo do arquivo...");
      let fileContent = await Promise.race([
        readFileContent(file),
        createTimeoutPromise(fileFormat === 'pdf' ? 30000 : 20000)
      ]);
      
      setStatusMessage("Dividindo texto em partes para análise...");
      const { chunks, warnings } = processAndChunkContent(fileContent, file.name, fileFormat);
      
      if (warnings) {
        console.warn("Avisos durante processamento:", warnings);
      }
      
      if (chunks.length === 0) {
        throw new Error("Não foi possível extrair conteúdo legível do documento.");
      }
      
      setStatusMessage(`Analisando ${chunks.length} partes do documento...`);
      const analysisResults = await analyzeDocumentChunks(chunks, file.name, documentType);
      
      setStatusMessage("Combinando resultados da análise...");
      const combinedAnalysis = combineChunkAnalysis(analysisResults);
      
      // Limpa timeouts e intervalos
      clearTimeout();
      clearInterval(uploadInterval);
      upload.completeUpload();
      setStatusMessage("");
      
      // Atualiza o documento com a análise
      updateDocumentWithAnalysis(newDocument, combinedAnalysis);
      
    } catch (error) {
      console.error("Erro no processamento:", error);
      
      if ((error as Error).message.includes("ler o arquivo")) {
        handleFileReadError(newDocument, error as Error);
      } else {
        handleProcessError(newDocument, error as Error);
      }
    }
  };

  return { processFile };
};
