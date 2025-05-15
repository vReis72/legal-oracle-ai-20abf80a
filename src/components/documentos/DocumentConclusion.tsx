
import React from 'react';

interface DocumentConclusionProps {
  conclusion: string | undefined;
}

const DocumentConclusion: React.FC<DocumentConclusionProps> = ({ conclusion }) => {
  if (!conclusion) return null;
  
  return (
    <div className="border rounded-lg p-4">
      <h3 className="text-lg font-medium mb-2">Conclusão</h3>
      <div className="whitespace-pre-line prose prose-sm max-w-none">
        {conclusion}
      </div>
    </div>
  );
};

export default DocumentConclusion;
