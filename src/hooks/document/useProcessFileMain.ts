
import { Document } from '@/types/document';
import { determineDocumentType, determineFileFormat } from '@/services/document/documentTypeDetector';
import { readFileContent, createTimeoutPromise } from '@/services/document/fileReader';
import { processAndChunkContent, analyzeDocumentChunks, combineChunkAnalysis } from '@/services/document/documentProcessor';
import { useDocumentValidation } from './use-document-validation';
import { useProcessingTimeout } from './use-processing-timeout';
import { useHandleFileReadError } from './useHandleFileReadError';
import { useHandleProcessError } from './useHandleProcessError';
import { useUpdateDocumentWithAnalysis } from './useUpdateDocumentWithAnalysis';
import { useSetupProcessingTimeout } from './useSetupProcessingTimeout';

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

  const handleFileReadError = useHandleFileReadError({
    setDocuments,
    upload,
    clearTimeout,
    toast,
  });

  const handleProcessError = useHandleProcessError({
    setDocuments,
    upload,
    clearTimeout,
    toast,
  });

  const updateDocumentWithAnalysis = useUpdateDocumentWithAnalysis({
    setDocuments,
    toast,
  });

  const setupProcessingTimeout = useSetupProcessingTimeout({
    setDocuments,
    toast,
    upload,
    setOrReplaceTimeout,
  });

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
