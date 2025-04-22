
import { useApiKey } from '@/context/ApiKeyContext';
import { Document } from '@/types/document';
import { useDocumentProcessor } from './document/use-document-processor';
import type { GptModel } from './use-documents';

export const useDocumentUpload = (
  documents: Document[], 
  setDocuments: React.Dispatch<React.SetStateAction<Document[]>>,
  setSelectedDocument: React.Dispatch<React.SetStateAction<Document | null>>,
  gptModel: GptModel
) => {
  const { isKeyConfigured } = useApiKey();
  
  const {
    uploading,
    uploadProgress,
    handleFileUpload,
    getStatusMessage
  } = useDocumentProcessor(documents, setDocuments, setSelectedDocument, isKeyConfigured, gptModel);

  return {
    uploading,
    uploadProgress,
    handleFileUpload,
    getStatusMessage
  };
};
