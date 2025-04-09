
import React from 'react';
import { Button } from "@/components/ui/button";
import { Search } from 'lucide-react';
import { Document } from '@/types/document';

interface DocumentHeaderProps {
  document: Document;
}

const DocumentHeader: React.FC<DocumentHeaderProps> = ({ document }) => {
  return (
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
  );
};

export default DocumentHeader;
