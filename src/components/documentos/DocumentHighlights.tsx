
import React from 'react';
import { Document } from '@/types/document';

interface DocumentHighlightsProps {
  highlights: Document['highlights'];
}

const DocumentHighlights: React.FC<DocumentHighlightsProps> = ({ highlights }) => {
  if (!highlights || highlights.length === 0) return null;
  
  return (
    <div className="border rounded-lg p-4">
      <h3 className="text-lg font-medium mb-2">Destaques</h3>
      <ul className="list-disc pl-5 space-y-4">
        {highlights.map((highlight, index) => (
          <li key={index} className="pb-3 last:pb-0">
            <div className={`font-medium ${highlight.importance === 'alta' ? 'text-red-700' : highlight.importance === 'média' ? 'text-amber-700' : 'text-blue-700'}`}>
              {highlight.text}
              <span className="text-sm text-muted-foreground ml-2">
                (Importância: {highlight.importance})
              </span>
            </div>
            
            {highlight.explanation && (
              <div className="mt-1 text-sm text-gray-600">
                {highlight.explanation}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DocumentHighlights;
