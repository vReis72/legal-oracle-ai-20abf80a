
import React from 'react';
import { FileText, FileUp, AlertCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface EmptyDocumentStateProps {
  errorState?: boolean;
  onUploadClick?: () => void;
}

const EmptyDocumentState: React.FC<EmptyDocumentStateProps> = ({ errorState = false, onUploadClick }) => {
  const handleClick = () => {
    if (onUploadClick) {
      onUploadClick();
    } else {
      // Fallback behavior - scroll to the uploader
      const uploader = document.getElementById('file-upload');
      if (uploader) {
        uploader.scrollIntoView({ behavior: 'smooth' });
        uploader.click();
      }
    }
  };
  
  if (errorState) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center bg-red-50 border border-dashed border-red-200 rounded-lg p-6">
        <AlertCircle className="h-16 w-16 text-red-400 mb-4" />
        <h3 className="text-lg font-medium mb-1">Problema no processamento</h3>
        <p className="text-sm text-muted-foreground max-w-sm mb-4">
          Houve um problema ao processar o documento. PDFs complexos ou protegidos podem não ser processados corretamente.
        </p>
        <Button onClick={handleClick} className="bg-red-600 hover:bg-red-700">
          <FileUp className="h-4 w-4 mr-2" />
          Tentar outro documento
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-64 text-center bg-muted/20 border border-dashed rounded-lg p-6">
      <FileText className="h-16 w-16 text-muted-foreground opacity-30 mb-4" />
      <h3 className="text-lg font-medium mb-1">Nenhum documento selecionado</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-4">
        Selecione um documento da lista ou faça upload de um novo documento para análise.
      </p>
      <Button onClick={handleClick} variant="outline">
        <FileUp className="h-4 w-4 mr-2" />
        Fazer upload de documento
      </Button>
    </div>
  );
};

export default EmptyDocumentState;
