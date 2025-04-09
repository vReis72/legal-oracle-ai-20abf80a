
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import DocumentSection from './DocumentSection';
import { Badge } from "@/components/ui/badge";
import { cn } from '@/lib/utils';
import { DocumentHighlight } from '@/services/documentService';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface HighlightsSectionProps {
  highlights: DocumentHighlight[];
  expanded: boolean;
  onToggle: () => void;
}

const HighlightsSection: React.FC<HighlightsSectionProps> = ({ highlights, expanded, onToggle }) => {
  const hasHighlights = Array.isArray(highlights) && highlights.length > 0;

  return (
    <DocumentSection 
      title="Trechos Relevantes" 
      icon={AlertTriangle} 
      expanded={expanded} 
      onToggle={onToggle}
    >
      {hasHighlights ? (
        <div className="space-y-3">
          {highlights.map((highlight, index) => (
            <div 
              key={index} 
              className={cn(
                "p-3 border-l-4 bg-background rounded",
                highlight.importance === 'high' 
                  ? "border-red-400" 
                  : highlight.importance === 'medium'
                    ? "border-amber-400"
                    : "border-blue-400" 
              )}
            >
              <p className="text-sm italic">"{highlight.text}"</p>
              <div className="flex justify-between mt-1">
                <span className="text-xs text-muted-foreground">
                  Página {highlight.page || 1}
                </span>
                <Badge 
                  variant="outline" 
                  className={cn(
                    "text-xs",
                    highlight.importance === 'high' 
                      ? "bg-red-50 text-red-800 border-red-200" 
                      : highlight.importance === 'medium'
                        ? "bg-amber-50 text-amber-800 border-amber-200"
                        : "bg-blue-50 text-blue-800 border-blue-200" 
                  )}
                >
                  {highlight.importance === 'high' 
                    ? 'Alta Relevância' 
                    : highlight.importance === 'medium' 
                      ? 'Relevância Média'
                      : 'Relevância Baixa'
                  }
                </Badge>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Alert variant="default" className="bg-amber-50 border-amber-200">
          <AlertTitle>Nenhum trecho relevante identificado</AlertTitle>
          <AlertDescription>
            Não foi possível extrair trechos relevantes deste documento.
            Isso pode ocorrer quando o conteúdo está mal formatado ou não apresenta trechos destacáveis.
          </AlertDescription>
        </Alert>
      )}
    </DocumentSection>
  );
};

export default HighlightsSection;
