
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DocumentUploader from '../components/documentos/DocumentUploader';
import DocumentList from '../components/documentos/DocumentList';
import DocumentAnalyzer from '../components/documentos/DocumentAnalyzer';
import { Document } from '@/types/document';
import { useDocumentStorage } from '@/hooks/document/useDocumentStorage';
import { toast } from "sonner";

const Documentos = () => {
  const { 
    documents, 
    saveDocument, 
    selectedDocumentId, 
    setSelectedDocumentId, 
    getSelectedDocument 
  } = useDocumentStorage();
  
  const selectedDocument = getSelectedDocument();

  const handleDocumentProcessed = (document: Document) => {
    saveDocument(document);
    setSelectedDocumentId(document.id);
    toast.success("Documento carregado e salvo localmente");
  };

  const handleDocumentSelect = (document: Document) => {
    setSelectedDocumentId(document.id);
  };

  const handleAnalysisComplete = (updatedDocument: Document) => {
    saveDocument(updatedDocument);
    toast.success("Análise concluída e salva localmente");
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
                selectedDocumentId={selectedDocumentId || undefined}
              />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default Documentos;
