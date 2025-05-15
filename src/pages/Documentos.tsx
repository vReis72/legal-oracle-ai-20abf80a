
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DocumentUploader from '../components/documentos/DocumentUploader';
import DocumentList from '../components/documentos/DocumentList';
import DocumentAnalyzer from '../components/documentos/DocumentAnalyzer';
import { Document } from '@/types/document';
import { useApiKey } from '@/context/ApiKeyContext';

const Documentos = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const { apiKey } = useApiKey();

  const handleDocumentProcessed = (document: Document) => {
    setDocuments(prev => [document, ...prev]);
    setSelectedDocument(document);
  };

  const handleDocumentSelect = (document: Document) => {
    setSelectedDocument(document);
  };

  const handleAnalysisComplete = (updatedDocument: Document) => {
    setDocuments(prev => 
      prev.map(doc => doc.id === updatedDocument.id ? updatedDocument : doc)
    );
    setSelectedDocument(updatedDocument);
  };

  return (
    <div className="eco-container">
      <div className="mb-6">
        <h1 className="text-3xl font-serif font-bold mb-2 text-eco-dark">Documentos</h1>
        <p className="text-muted-foreground mb-4">
          Analise e gerencie seus documentos jurídicos
        </p>
      </div>

      <div className="grid gap-6">
        <DocumentUploader onDocumentProcessed={handleDocumentProcessed} />

        {documents.length > 0 && (
          <Tabs defaultValue="view" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="view">Visualizar</TabsTrigger>
              <TabsTrigger value="list">Lista de Documentos ({documents.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="view">
              {selectedDocument ? (
                <DocumentAnalyzer 
                  document={selectedDocument} 
                  onAnalysisComplete={handleAnalysisComplete}
                  apiKey={apiKey}
                />
              ) : (
                <div className="text-center p-8 border rounded-lg">
                  Selecione um documento da lista para visualizar
                </div>
              )}
            </TabsContent>
            <TabsContent value="list">
              <DocumentList 
                documents={documents} 
                onSelectDocument={handleDocumentSelect} 
                selectedDocumentId={selectedDocument?.id}
              />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default Documentos;
