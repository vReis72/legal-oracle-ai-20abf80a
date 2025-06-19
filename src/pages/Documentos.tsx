
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
    console.log("Documentos.tsx - handleDocumentProcessed - ID:", document.id);
    console.log("Documentos.tsx - handleDocumentProcessed - Nome:", document.name);
    console.log("Documentos.tsx - handleDocumentProcessed - Primeiros 100 chars do conteúdo:", document.content?.substring(0, 100));
    console.log("Documentos.tsx - handleDocumentProcessed - Tamanho do conteúdo:", document.content?.length || 0, "caracteres");
    
    saveDocument(document);
    setSelectedDocumentId(document.id);
    toast.success("Documento carregado e salvo localmente");
    
    console.log("Documentos.tsx - Documento salvo com sucesso");
  };

  const handleDocumentSelect = (document: Document) => {
    console.log("Documentos.tsx - handleDocumentSelect - ID:", document.id);
    console.log("Documentos.tsx - handleDocumentSelect - Nome:", document.name);
    console.log("Documentos.tsx - handleDocumentSelect - Primeiros 100 chars do conteúdo:", document.content?.substring(0, 100));
    
    setSelectedDocumentId(document.id);
  };

  const handleAnalysisComplete = (updatedDocument: Document) => {
    console.log("Documentos.tsx - handleAnalysisComplete - ID:", updatedDocument.id);
    console.log("Documentos.tsx - handleAnalysisComplete - Conteúdo preservado?", !!updatedDocument.content);
    console.log("Documentos.tsx - handleAnalysisComplete - Primeiros 100 chars do conteúdo:", updatedDocument.content?.substring(0, 100));
    
    saveDocument(updatedDocument);
    toast.success("Análise concluída e salva localmente");
  };

  // Adicionar log quando o documento selecionado mudar
  React.useEffect(() => {
    if (selectedDocument) {
      console.log("Documentos.tsx - useEffect - Documento selecionado atualizado:");
      console.log("  ID:", selectedDocument.id);
      console.log("  Nome:", selectedDocument.name);
      console.log("  Conteúdo presente?", !!selectedDocument.content);
      console.log("  Tamanho do conteúdo:", selectedDocument.content?.length || 0);
      console.log("  Primeiros 100 chars do conteúdo:", selectedDocument.content?.substring(0, 100));
    }
  }, [selectedDocument]);

  return (
    <div className="eco-container">
      <div className="mb-4 md:mb-6">
        <h1 className="text-2xl md:text-3xl font-serif font-bold mb-2 text-eco-dark">Documentos</h1>
        <p className="text-sm md:text-base text-muted-foreground mb-4">
          Analise e gerencie seus documentos jurídicos
        </p>
      </div>

      <div className="grid gap-4 md:gap-6">
        <DocumentUploader onDocumentProcessed={handleDocumentProcessed} />

        {documents.length > 0 && (
          <Tabs defaultValue="view" className="w-full">
            <TabsList className="mb-4 w-full md:w-auto">
              <TabsTrigger value="view" className="flex-1 md:flex-initial text-sm">Visualizar</TabsTrigger>
              <TabsTrigger value="list" className="flex-1 md:flex-initial text-sm">Lista ({documents.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="view">
              {selectedDocument ? (
                <DocumentAnalyzer 
                  document={selectedDocument} 
                  onAnalysisComplete={handleAnalysisComplete}
                />
              ) : (
                <div className="text-center p-6 md:p-8 border rounded-lg">
                  <p className="text-sm md:text-base">Selecione um documento da lista para visualizar</p>
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
