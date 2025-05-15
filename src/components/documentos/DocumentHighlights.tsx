
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
      <ul className="list-disc pl-5 space-y-2">
        {highlights.map((highlight, index) => (
          <li key={index} className={`${highlight.importance === 'alta' ? 'text-red-700' : highlight.importance === 'média' ? 'text-amber-700' : 'text-blue-700'}`}>
            <span className="font-medium">{highlight.text}</span>
            <span className="text-sm text-muted-foreground ml-2">
              (Página {highlight.page}, Importância: {highlight.importance})
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DocumentHighlights;
