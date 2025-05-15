
import React from 'react';
import { Document } from '@/types/document';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger 
} from '@/components/ui/accordion';

interface DocumentKeyPointsProps {
  keyPoints: Document['keyPoints'];
}

const DocumentKeyPoints: React.FC<DocumentKeyPointsProps> = ({ keyPoints }) => {
  if (!keyPoints || keyPoints.length === 0) return null;
  
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="key-points">
        <AccordionTrigger>Pontos-Chave</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4">
            {keyPoints.map((point, index) => (
              <div key={index} className="border-b pb-2 last:border-b-0">
                <h4 className="font-medium">{point.title}</h4>
                <p className="text-sm">{point.description}</p>
              </div>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default DocumentKeyPoints;
