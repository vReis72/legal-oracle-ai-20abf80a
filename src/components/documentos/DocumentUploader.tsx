
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload } from "lucide-react";
import { Document } from "@/types/document";
import { useFileUpload } from "@/hooks/document/useFileUpload";
import DocumentFilePreview from './DocumentFilePreview';

interface DocumentUploaderProps {
  onDocumentProcessed: (document: Document) => void;
}

const DocumentUploader: React.FC<DocumentUploaderProps> = ({ onDocumentProcessed }) => {
  const { isUploading, selectedFile, handleFileChange, handleUpload } = useFileUpload({ 
    onDocumentProcessed 
  });

  const handleNormalUpload = () => handleUpload(false);
  const handleOcrUpload = () => handleUpload(true);

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
              onClick={handleNormalUpload} 
              disabled={!selectedFile || isUploading}
              variant="outline"
            >
              {isUploading ? "Processando..." : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Normal
                </>
              )}
            </Button>
            {selectedFile?.name.endsWith('.pdf') && (
              <Button 
                onClick={handleOcrUpload} 
                disabled={!selectedFile || isUploading}
              >
                {isUploading ? "Processando..." : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload OCR
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
        
        {selectedFile && (
          <div className="mt-4">
            <DocumentFilePreview file={selectedFile} />
          </div>
        )}
        
        <div className="text-sm text-muted-foreground">
          <p>Formatos aceitos: PDF, TXT</p>
          <p>Tamanho máximo: 10MB</p>
          <p><strong>Upload Normal:</strong> Extrai texto primeiro</p>
          <p><strong>Upload OCR:</strong> Usa OCR nativo do GPT-4o (recomendado para PDFs)</p>
        </div>
      </div>
    </div>
  );
};

export default DocumentUploader;
