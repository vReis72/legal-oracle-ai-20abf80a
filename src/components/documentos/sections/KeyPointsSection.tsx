
import React from 'react';
import { Bookmark } from 'lucide-react';
import DocumentSection from './DocumentSection';
import { Separator } from "@/components/ui/separator";
import { DocumentKeyPoint } from '@/services/documentService';

interface KeyPointsSectionProps {
  keyPoints: DocumentKeyPoint[];
  expanded: boolean;
  onToggle: () => void;
}

const KeyPointsSection: React.FC<KeyPointsSectionProps> = ({ keyPoints, expanded, onToggle }) => {
  return (
    <DocumentSection 
      title="Pontos Principais" 
      icon={Bookmark} 
      expanded={expanded} 
      onToggle={onToggle}
    >
      <div className="space-y-4">
        {keyPoints.map((point, index) => (
          <div key={index}>
            <h4 className="font-serif text-sm font-semibold mb-1">
              {point.title}
            </h4>
            <p className="text-sm">{point.description}</p>
            {index < keyPoints.length - 1 && (
              <Separator className="mt-3" />
            )}
          </div>
        ))}
      </div>
    </DocumentSection>
  );
};

export default KeyPointsSection;
