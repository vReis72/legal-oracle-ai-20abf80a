
import React from 'react';
import { FileText } from 'lucide-react';

const EmptyDocumentState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-center">
      <FileText className="h-16 w-16 text-muted-foreground opacity-30 mb-4" />
      <h3 className="text-lg font-medium mb-1">Nenhum documento selecionado</h3>
      <p className="text-sm text-muted-foreground max-w-sm">
        Selecione um documento da lista ou faça upload de um novo documento para análise.
      </p>
    </div>
  );
};

export default EmptyDocumentState;
