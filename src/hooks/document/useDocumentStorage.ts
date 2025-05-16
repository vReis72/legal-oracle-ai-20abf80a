import { useState, useEffect } from 'react';
import { Document } from '@/types/document';

const STORAGE_KEY = 'eco_documents';

/**
 * Hook para gerenciar o armazenamento de documentos no localStorage
 */
export const useDocumentStorage = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);

  useEffect(() => {
    loadDocuments();
  }, []);

  useEffect(() => {
    saveDocuments();
  }, [documents]);

  const loadDocuments = () => {
    try {
      const storedDocuments = localStorage.getItem(STORAGE_KEY);
      if (storedDocuments) {
        let parsedDocuments = JSON.parse(storedDocuments) as Document[];
        // Normalize dates after parsing
        parsedDocuments = normalizeDocumentDates(parsedDocuments);
        setDocuments(parsedDocuments);
      }
    } catch (error) {
      console.error("Erro ao carregar documentos do localStorage:", error);
    }
  };

  const saveDocuments = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(documents));
    } catch (error) {
      console.error("Erro ao salvar documentos no localStorage:", error);
    }
  };

  const saveDocument = (document: Document) => {
    const existingDocumentIndex = documents.findIndex(doc => doc.id === document.id);

    if (existingDocumentIndex > -1) {
      // Update existing document
      const updatedDocuments = [...documents];
      updatedDocuments[existingDocumentIndex] = document;
      setDocuments(updatedDocuments);
    } else {
      // Add new document
      setDocuments([...documents, document]);
    }
  };

  const deleteDocument = (documentId: string) => {
    const updatedDocuments = documents.filter(doc => doc.id !== documentId);
    setDocuments(updatedDocuments);
    setSelectedDocumentId(null); // Clear selected document if it was the deleted one
  };

  const getSelectedDocument = (): Document | undefined => {
    return documents.find(doc => doc.id === selectedDocumentId);
  };

  // Adicionar função para garantir que os tipos dos campos estejam corretos
  // Especialmente para transformar strings de data em objetos Date
  function normalizeDocumentDates(documents: Document[]): Document[] {
    return documents.map(doc => {
      // Se uploadDate for uma string, converta para Date
      if (doc.uploadDate && typeof doc.uploadDate === 'string') {
        return {
          ...doc,
          uploadDate: new Date(doc.uploadDate)
        };
      }
      return doc;
    });
  }

  return {
    documents,
    saveDocument,
    deleteDocument,
    selectedDocumentId,
    setSelectedDocumentId,
    getSelectedDocument
  };
};
