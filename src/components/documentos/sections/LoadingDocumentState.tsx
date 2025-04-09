
import React from 'react';
import { Loader2 } from 'lucide-react';
import { Document } from '@/types/document';
import DocumentHeader from '../DocumentHeader';

interface LoadingDocumentStateProps {
  document: Document;
}

const LoadingDocumentState: React.FC<LoadingDocumentStateProps> = ({ document }) => {
  return (
    <div>
      <DocumentHeader document={document} />
      <div className="flex flex-col items-center justify-center h-64 bg-muted/30 rounded-lg border border-dashed">
        <Loader2 className="h-10 w-10 text-eco-primary animate-spin mb-4" />
        <h3 className="text-lg font-medium mb-1">Analisando documento</h3>
        <p className="text-sm text-muted-foreground">
          Isto pode levar alguns minutos...
        </p>
      </div>
    </div>
  );
};

export default LoadingDocumentState;
