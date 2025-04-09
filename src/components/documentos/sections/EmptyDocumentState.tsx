
import React from 'react';
import { FileText, FileUp, AlertCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface EmptyDocumentStateProps {
  errorState?: boolean;
  errorMessage?: string;
  isPdf?: boolean;
  onUploadClick?: () => void;
}

const EmptyDocumentState: React.FC<EmptyDocumentStateProps> = ({ 
  errorState = false, 
  errorMessage,
  isPdf = false,
  onUploadClick 
}) => {
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
        
        {errorMessage ? (
          <p className="text-sm text-muted-foreground max-w-md mb-4">
            {errorMessage}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground max-w-md mb-4">
            {isPdf ? 
              "O PDF pode estar protegido ou ter sido digitalizado como imagem. Experimente converter o PDF para um formato com texto selecionável ou tente um arquivo menor." :
              "Houve um problema ao processar o documento. Verifique se o arquivo não está corrompido e tente novamente."
            }
          </p>
        )}

        {isPdf && (
          <Alert variant="default" className="mb-4 bg-blue-50 border-blue-200 text-left w-full">
            <AlertTitle className="text-sm">Dicas para PDFs:</AlertTitle>
            <AlertDescription className="text-xs">
              <ul className="list-disc pl-4">
                <li>Use PDFs gerados digitalmente, não escaneados</li>
                <li>Verifique se o texto é selecionável no PDF original</li>
                <li>Tente converter o PDF com uma ferramenta online para PDF com OCR</li>
                <li>Arquivos menores têm maior chance de sucesso</li>
              </ul>
            </AlertDescription>
          </Alert>
        )}
        
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
