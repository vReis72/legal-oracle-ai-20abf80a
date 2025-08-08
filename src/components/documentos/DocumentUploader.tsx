
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Upload, Info } from "lucide-react";
import { Document } from "@/types/document";
import { useFileUpload } from "@/hooks/document/useFileUpload";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import DocumentFilePreview from './DocumentFilePreview';

interface DocumentUploaderProps {
  onDocumentProcessed: (document: Document) => void;
}

const DocumentUploader: React.FC<DocumentUploaderProps> = ({ onDocumentProcessed }) => {
  const [processImages, setProcessImages] = useState(false);
  const { isUploading, selectedFile, handleFileChange, handleUpload } = useFileUpload({ 
    onDocumentProcessed 
  });

  const handleUploadClick = () => handleUpload(processImages);
  
  const isPdf = selectedFile?.name.endsWith('.pdf');
  const shouldSuggestImageProcessing = isPdf && selectedFile && selectedFile.size > 1024 * 1024; // > 1MB

  return (
    <div className="border rounded-lg p-6 bg-white shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Upload de Documento</h2>
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Input 
            type="file" 
            accept=".pdf,.txt" 
            onChange={handleFileChange}
            disabled={isUploading}
          />
          <div className="flex gap-2 shrink-0">
            <Button 
              onClick={handleUploadClick} 
              disabled={!selectedFile || isUploading}
              variant="outline"
            >
              {isUploading ? "Processando..." : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload
                </>
              )}
            </Button>
          </div>
        </div>
        
        {isPdf && (
          <div className="flex items-center space-x-2 p-3 bg-muted/50 rounded-lg">
            <Checkbox 
              id="process-images" 
              checked={processImages}
              onCheckedChange={(checked) => setProcessImages(checked as boolean)}
            />
            <div className="flex items-center gap-2">
              <label 
                htmlFor="process-images" 
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                Processar imagens também?
              </label>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs text-sm">
                    Marque esta opção se o documento contém elementos visuais importantes como 
                    gráficos, tabelas complexas, selos, carimhos ou se o texto não foi extraído corretamente.
                    {shouldSuggestImageProcessing && (
                      <span className="block mt-1 font-medium text-orange-600">
                        💡 Recomendado para este PDF (arquivo grande detectado)
                      </span>
                    )}
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        )}
        
        {selectedFile && (
          <div className="mt-4">
            <DocumentFilePreview file={selectedFile} />
          </div>
        )}
        
        <div className="text-sm text-muted-foreground">
          <p>Formatos aceitos: PDF, TXT</p>
          <p>Tamanho máximo: 10MB</p>
          <p><strong>Upload:</strong> Extrai texto automaticamente do documento</p>
          {isPdf && (
            <p><strong>Processamento de imagens:</strong> Analisa elementos visuais quando marcado (mais lento, mas mais completo)</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentUploader;
