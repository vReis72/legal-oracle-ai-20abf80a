
import { useLocalStorage } from './useLocalStorage';
import { Document } from '@/types/document';

/**
 * Custom hook for managing document storage in localStorage
 */
export const useDocumentStorage = () => {
  const [documents, setDocuments] = useLocalStorage<Document[]>('eco-documentos', []);
  const [selectedDocumentId, setSelectedDocumentId] = useLocalStorage<string | null>('eco-selected-document', null);

  // Save or update a document in the storage
  const saveDocument = (document: Document) => {
    setDocuments(prev => {
      // Check if document already exists
      const exists = prev.some(doc => doc.id === document.id);
      
      if (exists) {
        // Update existing document
        return prev.map(doc => doc.id === document.id ? document : doc);
      } else {
        // Add new document
        return [document, ...prev];
      }
    });
  };

  // Get a document by its ID
  const getDocument = (id: string): Document | undefined => {
    return documents.find(doc => doc.id === id);
  };

  // Get the selected document
  const getSelectedDocument = (): Document | null => {
    if (!selectedDocumentId) return null;
    return documents.find(doc => doc.id === selectedDocumentId) || null;
  };

  return {
    documents,
    setDocuments,
    selectedDocumentId,
    setSelectedDocumentId,
    saveDocument,
    getDocument,
    getSelectedDocument
  };
};
