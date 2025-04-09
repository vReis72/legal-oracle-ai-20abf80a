
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  PencilRuler, 
  AlertTriangle, 
  Bookmark,
  ChevronDown, 
  ChevronUp,
  Loader2, 
  Search
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Document } from '@/types/document';

interface DocumentDetailProps {
  document: Document | null;
}

const DocumentDetail: React.FC<DocumentDetailProps> = ({ document }) => {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
    }
  };

  if (!document) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <FileText className="h-16 w-16 text-muted-foreground opacity-30 mb-4" />
        <h3 className="text-lg font-medium mb-1">Nenhum documento selecionado</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Selecione um documento da lista ou faça upload de um novo documento para análise.
        </p>
      </div>
    );
  }

  if (!document.processed) {
    return (
      <div>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="font-serif text-xl">{document.name}</h2>
            <p className="text-sm text-muted-foreground">
              Carregado em {document.uploadDate.toLocaleDateString('pt-BR')}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center h-64 bg-muted/30 rounded-lg border border-dashed">
          <Loader2 className="h-10 w-10 text-eco-primary animate-spin mb-4" />
          <h3 className="text-lg font-medium mb-1">Analisando documento</h3>
          <p className="text-sm text-muted-foreground">
            Isto pode levar alguns minutos...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="font-serif text-xl">{document.name}</h2>
          <p className="text-sm text-muted-foreground">
            Carregado em {document.uploadDate.toLocaleDateString('pt-BR')}
          </p>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-eco-secondary hover:text-eco-dark hover:bg-eco-muted"
        >
          <Search className="h-4 w-4 mr-1" />
          Ver original
        </Button>
      </div>

      <ScrollArea className="h-[calc(100vh-24rem)]">
        <div className="space-y-6">
          {/* Resumo Executivo */}
          <Card>
            <CardHeader 
              className={cn(
                "pb-2 cursor-pointer",
                expandedSection === 'resumo' ? "" : "pb-0"
              )}
              onClick={() => toggleSection('resumo')}
            >
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg flex items-center">
                  <PencilRuler className="h-5 w-5 mr-2" />
                  Resumo Executivo
                </CardTitle>
                {expandedSection === 'resumo' ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </div>
            </CardHeader>
            {expandedSection === 'resumo' && (
              <CardContent>
                <p className="text-sm leading-relaxed">
                  {document.summary}
                </p>
              </CardContent>
            )}
          </Card>

          {/* Trechos Relevantes */}
          <Card>
            <CardHeader 
              className={cn(
                "pb-2 cursor-pointer",
                expandedSection === 'highlights' ? "" : "pb-0"
              )}
              onClick={() => toggleSection('highlights')}
            >
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Trechos Relevantes
                </CardTitle>
                {expandedSection === 'highlights' ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </div>
            </CardHeader>
            {expandedSection === 'highlights' && document.highlights && (
              <CardContent>
                <div className="space-y-3">
                  {document.highlights.map((highlight, index) => (
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
                          Página {highlight.page}
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
              </CardContent>
            )}
          </Card>

          {/* Pontos Principais */}
          <Card>
            <CardHeader 
              className={cn(
                "pb-2 cursor-pointer",
                expandedSection === 'keypoints' ? "" : "pb-0"
              )}
              onClick={() => toggleSection('keypoints')}
            >
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg flex items-center">
                  <Bookmark className="h-5 w-5 mr-2" />
                  Pontos Principais
                </CardTitle>
                {expandedSection === 'keypoints' ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </div>
            </CardHeader>
            {expandedSection === 'keypoints' && document.keyPoints && (
              <CardContent>
                <div className="space-y-4">
                  {document.keyPoints.map((point, index) => (
                    <div key={index}>
                      <h4 className="font-serif text-sm font-semibold mb-1">
                        {point.title}
                      </h4>
                      <p className="text-sm">{point.description}</p>
                      {index < document.keyPoints!.length - 1 && (
                        <Separator className="mt-3" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>

          {/* Conteúdo Completo */}
          <Card>
            <CardHeader 
              className={cn(
                "pb-2 cursor-pointer",
                expandedSection === 'content' ? "" : "pb-0"
              )}
              onClick={() => toggleSection('content')}
            >
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Conteúdo Completo
                </CardTitle>
                {expandedSection === 'content' ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </div>
            </CardHeader>
            {expandedSection === 'content' && (
              <CardContent>
                <p className="text-sm whitespace-pre-line leading-relaxed">
                  {document.content}
                </p>
              </CardContent>
            )}
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
};

export default DocumentDetail;
