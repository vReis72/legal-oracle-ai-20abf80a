
import React from "react";
import { Button } from "@/components/ui/button";
import { Document } from "@/types/document";
import DocumentExportButton from "./DocumentExportButton";

interface DocumentMetadataProps {
  document: Document;
  isAnalyzing: boolean;
  onAnalyze: () => void;
}

const DocumentMetadata: React.FC<DocumentMetadataProps> = ({
  document,
  isAnalyzing,
  onAnalyze,
}) => {
  const formatDate = (date: Date | string) => {
    const dateObj = date instanceof Date ? date : new Date(date);
    return dateObj.toLocaleDateString();
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 pb-6 border-b gap-4">
      <div>
        <h2 className="text-xl font-bold mb-2">{document.name}</h2>
        <div className="text-sm text-muted-foreground">
          <p>Tipo: {document.type}</p>
          <p>Data de upload: {formatDate(document.uploadDate)}</p>
        </div>
      </div>
      <div className="flex gap-3">
        <DocumentExportButton document={document} disabled={isAnalyzing} />
        <Button 
          onClick={onAnalyze} 
          disabled={isAnalyzing}
        >
          {document.processed ? "Analisar Novamente" : "Analisar Documento"}
        </Button>
      </div>
    </div>
  );
};

export default DocumentMetadata;
