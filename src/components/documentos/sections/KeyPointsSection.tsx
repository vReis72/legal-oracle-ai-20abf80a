
import React from 'react';
import { Bookmark } from 'lucide-react';
import DocumentSection from './DocumentSection';
import { Separator } from "@/components/ui/separator";
import { DocumentKeyPoint } from '@/services/documentService';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface KeyPointsSectionProps {
  keyPoints: DocumentKeyPoint[];
  expanded: boolean;
  onToggle: () => void;
}

const KeyPointsSection: React.FC<KeyPointsSectionProps> = ({ keyPoints, expanded, onToggle }) => {
  const hasKeyPoints = Array.isArray(keyPoints) && keyPoints.length > 0;

  return (
    <DocumentSection 
      title="Pontos Principais" 
      icon={Bookmark} 
      expanded={expanded} 
      onToggle={onToggle}
    >
      {hasKeyPoints ? (
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
      ) : (
        <Alert variant="default" className="bg-amber-50 border-amber-200">
          <AlertTitle>Nenhum ponto principal identificado</AlertTitle>
          <AlertDescription>
            Não foi possível extrair pontos principais deste documento.
            Isso pode ocorrer quando o conteúdo está mal formatado ou não apresenta pontos destacáveis.
          </AlertDescription>
        </Alert>
      )}
    </DocumentSection>
  );
};

export default KeyPointsSection;
