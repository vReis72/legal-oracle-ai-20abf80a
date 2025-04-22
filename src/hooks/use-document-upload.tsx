
import { useApiKey } from '@/context/ApiKeyContext';
import { Document } from '@/types/document';
import { useDocumentProcessor } from './document/use-document-processor';

/**
 * Hook principal para upload de documentos
 */
export const useDocumentUpload = (
  documents: Document[], 
  setDocuments: React.Dispatch<React.SetStateAction<Document[]>>,
  setSelectedDocument: React.Dispatch<React.SetStateAction<Document | null>>
) => {
  const { isKeyConfigured } = useApiKey();
  
  // Usa o hook de processamento de documentos
  const {
    uploading,
    uploadProgress,
    handleFileUpload,
    getStatusMessage
  } = useDocumentProcessor(documents, setDocuments, setSelectedDocument, isKeyConfigured);

  return {
    uploading,
    uploadProgress,
    handleFileUpload,
    getStatusMessage
  };
};
