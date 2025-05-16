
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
    if (documents.length > 0) {
      console.log("useDocumentStorage - Salvando documentos no localStorage");
      console.log(`useDocumentStorage - Total de documentos: ${documents.length}`);
      // Verificar o tamanho do primeiro documento para diagnóstico
      if (documents[0]) {
        console.log("useDocumentStorage - Amostra do primeiro documento:");
        console.log("  ID:", documents[0].id);
        console.log("  Nome:", documents[0].name);
        console.log("  Conteúdo presente?", !!documents[0].content);
        console.log("  Tamanho do conteúdo:", documents[0].content?.length || 0);
      }
      saveDocuments();
    }
  }, [documents]);

  const loadDocuments = () => {
    try {
      const storedDocuments = localStorage.getItem(STORAGE_KEY);
      if (storedDocuments) {
        console.log("useDocumentStorage - Carregando documentos do localStorage");
        let parsedDocuments = JSON.parse(storedDocuments) as Document[];
        console.log(`useDocumentStorage - ${parsedDocuments.length} documentos carregados`);
        
        // Normalize dates after parsing
        parsedDocuments = normalizeDocumentDates(parsedDocuments);
        
        // Verificar se os documentos têm o conteúdo preservado
        parsedDocuments.forEach((doc, index) => {
          console.log(`useDocumentStorage - Documento ${index + 1} (${doc.id}):`);
          console.log(`  Nome: ${doc.name}`);
          console.log(`  Conteúdo presente? ${!!doc.content}`);
          console.log(`  Tamanho do conteúdo: ${doc.content?.length || 0} caracteres`);
          if (doc.content) {
            console.log(`  Primeiros 100 caracteres: ${doc.content.substring(0, 100)}`);
          }
        });
        
        setDocuments(parsedDocuments);
      }
    } catch (error) {
      console.error("Erro ao carregar documentos do localStorage:", error);
    }
  };

  const saveDocuments = () => {
    try {
      const documentsToSave = [...documents]; // Criar cópia para não modificar o estado atual
      
      // Verificar tamanho do conteúdo antes de salvar
      let totalSize = 0;
      documentsToSave.forEach(doc => {
        if (doc.content) {
          totalSize += doc.content.length;
        }
      });
      
      console.log(`useDocumentStorage - Tamanho total dos conteúdos: ${totalSize} caracteres`);
      
      if (totalSize > 5000000) {
        console.warn("useDocumentStorage - Conteúdo muito grande para localStorage (>5MB)");
        // Podemos implementar alguma estratégia de compressão ou truncamento aqui se necessário
      }
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(documentsToSave));
      console.log("useDocumentStorage - Documentos salvos no localStorage com sucesso");
    } catch (error) {
      console.error("Erro ao salvar documentos no localStorage:", error);
      
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        console.error("useDocumentStorage - Limite de armazenamento excedido");
      }
    }
  };

  const saveDocument = (document: Document) => {
    console.log("useDocumentStorage - saveDocument - Salvando documento:");
    console.log("  ID:", document.id);
    console.log("  Nome:", document.name);
    console.log("  Conteúdo presente?", !!document.content);
    console.log("  Tamanho do conteúdo:", document.content?.length || 0, "caracteres");
    
    const existingDocumentIndex = documents.findIndex(doc => doc.id === document.id);

    if (existingDocumentIndex > -1) {
      // Update existing document
      console.log(`useDocumentStorage - Atualizando documento existente no índice ${existingDocumentIndex}`);
      const updatedDocuments = [...documents];
      updatedDocuments[existingDocumentIndex] = document;
      setDocuments(updatedDocuments);
    } else {
      // Add new document
      console.log("useDocumentStorage - Adicionando novo documento");
      setDocuments([...documents, document]);
    }
  };

  const deleteDocument = (documentId: string) => {
    const updatedDocuments = documents.filter(doc => doc.id !== documentId);
    setDocuments(updatedDocuments);
    setSelectedDocumentId(null); // Clear selected document if it was the deleted one
  };

  const getSelectedDocument = (): Document | undefined => {
    const selected = documents.find(doc => doc.id === selectedDocumentId);
    if (selected) {
      console.log("useDocumentStorage - getSelectedDocument - Documento encontrado:");
      console.log("  ID:", selected.id);
      console.log("  Nome:", selected.name);
      console.log("  Conteúdo presente?", !!selected.content);
      console.log("  Tamanho do conteúdo:", selected.content?.length || 0);
      if (selected.content) {
        console.log("  Primeiros 100 caracteres:", selected.content.substring(0, 100));
      }
    }
    return selected;
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
