
import React from 'react';

interface DocumentSummaryProps {
  summary: string;
}

const DocumentSummary: React.FC<DocumentSummaryProps> = ({ summary }) => {
  if (!summary) return null;
  
  return (
    <div className="border rounded-lg p-4">
      <h3 className="text-lg font-medium mb-3">Resumo do Documento</h3>
      <div className="whitespace-pre-line prose prose-sm max-w-none">
        {summary.trim()}
      </div>
    </div>
  );
};

export default DocumentSummary;
