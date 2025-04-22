
import { useState } from 'react';
import { Document } from '@/types/document';
import { useToast } from '@/hooks/use-toast';
import { useProcessFile } from './use-process-file';
import { useUploadProgress } from './use-upload-progress';

/**
 * Hook principal para processamento de documentos
 */
export const useDocumentProcessor = (
  documents: Document[],
  setDocuments: React.Dispatch<React.SetStateAction<Document[]>>,
  setSelectedDocument: React.Dispatch<React.SetStateAction<Document | null>>,
  isKeyConfigured: boolean
) => {
  // Estado para controle de mensagens de status
  const [statusMessage, setStatusMessage] = useState<string>('');
  
  // Toast notifications
  const { toast } = useToast();

  // Progresso de upload
  const upload = useUploadProgress();

  // Processamento de arquivo
  const { processFile } = useProcessFile({
    setDocuments,
    setSelectedDocument,
    toast,
    upload,
    isKeyConfigured,
    setStatusMessage
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

  /**
   * Obtém a mensagem de status com base no progresso
   */
  const getStatusMessage = () => {
    if (statusMessage) {
      return statusMessage;
    }
    
    if (upload.uploadProgress < 30) return "Enviando documento...";
    if (upload.uploadProgress < 70) return "Extraindo e processando texto...";
    if (upload.uploadProgress < 90) return "Analisando conteúdo...";
    return "Finalizando análise...";
  };

  return {
    uploading: upload.uploading,
    uploadProgress: upload.uploadProgress,
    handleFileUpload,
    getStatusMessage
  };
};
