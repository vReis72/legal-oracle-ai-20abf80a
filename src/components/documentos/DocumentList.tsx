
import React from 'react';
import { FileText } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Check, Loader2 } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from '@/lib/utils';
import { Document } from '@/types/document';

interface DocumentListProps {
  documents: Document[];
  selectedDocument: Document | null;
  onSelectDocument: (doc: Document) => void;
}

const DocumentList: React.FC<DocumentListProps> = ({ 
  documents, 
  selectedDocument, 
  onSelectDocument 
}) => {
  return (
    <div className="w-1/3 border-r pr-4">
      <h3 className="text-sm font-medium mb-3">Documentos</h3>
      <ScrollArea className="h-[calc(100vh-24rem)]">
        <div className="space-y-2 pr-2">
          {documents.map(doc => (
            <div 
              key={doc.id} 
              className={cn(
                "p-3 border rounded-md cursor-pointer hover:bg-muted/50 transition-all",
                selectedDocument?.id === doc.id && "border-eco-primary bg-eco-muted/30"
              )}
              onClick={() => onSelectDocument(doc)}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-start space-x-2">
                  <FileText className={cn(
                    "h-5 w-5 mt-0.5",
                    doc.type === 'parecer' ? "text-blue-500" : 
                    doc.type === 'auto-de-infracao' ? "text-red-500" : 
                    "text-green-500"
                  )} />
                  <div>
                    <p className="text-sm font-medium line-clamp-1">{doc.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {doc.uploadDate.toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
                {doc.processed ? (
                  <Badge variant="outline" className="bg-eco-light text-eco-dark text-xs">
                    <Check className="h-3 w-3 mr-1" />
                    Analisado
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-muted text-xs">
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    Processando
                  </Badge>
                )}
              </div>
              
              <div className="mt-2">
                <Badge 
                  variant="secondary" 
                  className={cn(
                    "text-xs",
                    doc.type === 'parecer' ? "bg-blue-100 text-blue-800" : 
                    doc.type === 'auto-de-infracao' ? "bg-red-100 text-red-800" : 
                    "bg-green-100 text-green-800"
                  )}
                >
                  {doc.type === 'parecer' 
                    ? 'Parecer Técnico' 
                    : doc.type === 'auto-de-infracao' 
                      ? 'Auto de Infração' 
                      : 'Licença Ambiental'
                  }
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default DocumentList;
