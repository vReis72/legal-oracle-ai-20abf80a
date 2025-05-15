
import React from 'react';
import { Document } from '@/types/document';
import { FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface DocumentMetadataProps {
  document: Document;
  isAnalyzing: boolean;
  onAnalyze: () => void;
}

const DocumentMetadata: React.FC<DocumentMetadataProps> = ({ 
  document, 
  isAnalyzing, 
  onAnalyze 
}) => {
  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold flex items-center">
          <FileText className="h-5 w-5 mr-2" />
          {document.name}
        </h2>
        
        {!document.processed && (
          <Button 
            onClick={onAnalyze} 
            disabled={isAnalyzing || !document.content}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analisando...
              </>
            ) : "Analisar Documento"}
          </Button>
        )}
      </div>
      
      <div className="text-sm text-muted-foreground mb-4">
        <p>Tipo: {document.type.toUpperCase()}</p>
        <p>Data de Upload: {document.uploadDate.toLocaleDateString()}</p>
      </div>
    </>
  );
};

export default DocumentMetadata;
