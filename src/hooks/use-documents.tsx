
import { useState } from 'react';
import { Document } from '@/types/document';
import { useDocumentUpload } from './use-document-upload';
import { getSampleDocuments } from './use-document-sample-data';

export type GptModel = 'gpt-3.5-turbo' | 'gpt-4-turbo';

export const useDocuments = () => {
  const [documents, setDocuments] = useState<Document[]>(getSampleDocuments());
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [gptModel, setGptModel] = useState<GptModel>('gpt-4-turbo');
  
  const { 
    uploading, 
    uploadProgress, 
    handleFileUpload,
    getStatusMessage
  } = useDocumentUpload(documents, setDocuments, setSelectedDocument, gptModel);

  return {
    documents,
    uploading,
    uploadProgress,
    selectedDocument,
    setSelectedDocument,
    handleFileUpload,
    getStatusMessage,
    gptModel,
    setGptModel
  };
};
