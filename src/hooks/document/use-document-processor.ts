
import { useToast } from '@/hooks/use-toast';
import { useUploadProgress } from './use-upload-progress';
import { useProcessFile } from './use-process-file';
import { Document } from '@/types/document';

/**
 * Hook principal e organizador de processamento de documentos
 */
export const useDocumentProcessor = (
  documents: Document[],
  setDocuments: React.Dispatch<React.SetStateAction<Document[]>>,
  setSelectedDocument: React.Dispatch<React.SetStateAction<Document | null>>,
  isKeyConfigured: boolean
) => {
  // Toast (shadcn)
  const { toast } = useToast();

  // Progresso de upload
  const upload = useUploadProgress();

  // Uso da lógica isolada para processar arquivo
  const { processFile } = useProcessFile({
    setDocuments,
    setSelectedDocument,
    toast,
    upload,
    isKeyConfigured,
  });

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
    uploading: upload.uploading,
    uploadProgress: upload.uploadProgress,
    handleFileUpload,
    getStatusMessage: upload.getStatusMessage
  };
};
