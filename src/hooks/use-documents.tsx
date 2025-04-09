
import { useState } from 'react';
import { Document } from '@/types/document';
import { useDocumentUpload } from './use-document-upload';
import { getSampleDocuments } from './use-document-sample-data';

export const useDocuments = () => {
  const [documents, setDocuments] = useState<Document[]>(getSampleDocuments());
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  
  const { 
    uploading, 
    uploadProgress, 
    handleFileUpload,
    getStatusMessage
  } = useDocumentUpload(documents, setDocuments, setSelectedDocument);

  return {
    documents,
    uploading,
    uploadProgress,
    selectedDocument,
    setSelectedDocument,
    handleFileUpload,
    getStatusMessage
  };
};
