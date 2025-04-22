
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DocumentUploader from './DocumentUploader';
import DocumentList from './DocumentList';
import DocumentDetail from './DocumentDetail';
import { useDocuments } from '@/hooks/use-documents';

const DocumentReader = () => {
  const { 
    documents, 
    uploading, 
    uploadProgress, 
    selectedDocument, 
    setSelectedDocument, 
    handleFileUpload,
    getStatusMessage,
    gptModel,
    setGptModel
  } = useDocuments();

  return (
    <div className="flex flex-col h-full space-y-6">
      <DocumentUploader 
        onFileUpload={handleFileUpload} 
        uploading={uploading} 
        uploadProgress={uploadProgress}
        getStatusMessage={getStatusMessage}
        gptModel={gptModel}
        setGptModel={setGptModel}
      />

      <div className="flex flex-col flex-grow">
        <Tabs defaultValue="todos" className="flex-grow flex flex-col">
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="todos">Todos</TabsTrigger>
              <TabsTrigger value="pareceres">Pareceres</TabsTrigger>
              <TabsTrigger value="autos">Autos de Infração</TabsTrigger>
              <TabsTrigger value="licencas">Licenças</TabsTrigger>
            </TabsList>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{documents.length} documentos</span>
              <span>•</span>
              <span>{documents.filter(d => d.processed).length} analisados</span>
            </div>
          </div>
          
          <div className="mt-4 flex-grow flex">
            <DocumentList 
              documents={documents} 
              selectedDocument={selectedDocument} 
              onSelectDocument={setSelectedDocument} 
            />
            
            <div className="w-2/3 pl-4">
              <DocumentDetail document={selectedDocument} />
            </div>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default DocumentReader;
