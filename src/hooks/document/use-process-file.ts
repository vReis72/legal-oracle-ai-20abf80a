
import { Document } from '@/types/document';
import { processDocument, determineDocumentType } from '@/services/documentService';
import { readFileContent, createTimeoutPromise } from './use-file-reader';
import { useDocumentValidation } from './use-document-validation';
import { useProcessingTimeout } from './use-processing-timeout';

import { handleFileReadError, handleProcessError } from './fileProcessErrorHandler';
import { setProcessedDocumentAnalysis } from './documentStateUtils';
import { setGlobalProcessTimeout } from './processTimeoutUtils';

interface UseProcessFileProps {
  setDocuments: React.Dispatch<React.SetStateAction<Document[]>>;
  setSelectedDocument: React.Dispatch<React.SetStateAction<Document | null>>;
  toast: ReturnType<typeof import('@/hooks/use-toast').useToast>['toast'];
  upload: ReturnType<typeof import('./use-upload-progress').useUploadProgress>;
  isKeyConfigured: boolean;
}

/**
 * Lógica isolada de processamento de arquivo (refatorado e enxuto)
 */
export const useProcessFile = ({
  setDocuments,
  setSelectedDocument,
  toast,
  upload,
  isKeyConfigured,
}: UseProcessFileProps) => {
  const { validateFileSize, validateApiKey } = useDocumentValidation();
  const { setOrReplaceTimeout, clear: clearTimeout } = useProcessingTimeout();

  /**
   * Função para processar arquivo
   */
  const processFile = async (file: File) => {
    if (!validateFileSize(file)) return;
    if (!validateApiKey(isKeyConfigured)) return;

    const isPdf = file.name.toLowerCase().endsWith('.pdf');
    const documentType = determineDocumentType(file.name);
    const uploadInterval = upload.simulateUploadProgress(isPdf);

    const newDocument: Document = {
      id: Date.now().toString(),
      name: file.name,
      type: documentType,
      uploadDate: new Date(),
      processed: false
    };

    setDocuments(prev => [newDocument, ...prev]);
    setSelectedDocument(newDocument);

    // Timeout handler
    setGlobalProcessTimeout(
      () => {
        console.log('Timeout de segurança global acionado');
        clearInterval(uploadInterval);
        upload.completeUpload();
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
      },
      setOrReplaceTimeout,
      45000
    );

    let fileContent: string | undefined;
    try {
      fileContent = await Promise.race([
        readFileContent(file),
        createTimeoutPromise(isPdf ? 30000 : 20000)
      ]);
    } catch (error) {
      handleFileReadError(
        newDocument,
        setDocuments,
        () => clearInterval(uploadInterval),
        () => upload.completeUpload(),
        clearTimeout,
        toast,
        isPdf
      );
      return;
    }

    try {
      // Serviço centralizado de processamento já inclui extração e chunking
      const analysis = await processDocument(fileContent, file.name, documentType);

      clearTimeout();
      clearInterval(uploadInterval);
      upload.completeUpload();

      setProcessedDocumentAnalysis(newDocument, setDocuments, analysis);

      toast({
        variant: "default",
        title: "Documento processado",
        description: analysis.summary?.includes("[Aviso") || analysis.keyPoints?.some((kp: any) => kp.title?.includes("Aviso"))
          ? "O documento foi analisado, mas com algumas limitações."
          : "O documento foi analisado com sucesso.",
      });
    } catch (error) {
      handleProcessError(
        newDocument,
        setDocuments,
        () => clearInterval(uploadInterval),
        () => upload.completeUpload(),
        clearTimeout,
        fileContent,
        toast
      );
    }
  };

  return { processFile };
};
