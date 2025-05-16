
import React, { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload } from "lucide-react";
import { Document } from "@/types/document";
import { useFileUpload } from "@/hooks/document/useFileUpload";
import { configurePdfWorker } from "@/utils/pdf/pdfWorkerConfig";
import DocumentFilePreview from './DocumentFilePreview';
import { toast } from "sonner";

interface DocumentUploaderProps {
  onDocumentProcessed: (document: Document) => void;
}

const DocumentUploader: React.FC<DocumentUploaderProps> = ({ onDocumentProcessed }) => {
  const { isUploading, selectedFile, handleFileChange, handleUpload } = useFileUpload({ 
    onDocumentProcessed 
  });

  // Configure PDF.js worker when the component mounts
  useEffect(() => {
    const workerResult = configurePdfWorker({
      verbose: true,
      showToasts: true
    });
    
    if (workerResult.success) {
      console.log("Worker do PDF.js configurado com sucesso:", workerResult.workerSrc);
    } else {
      console.error("Falha ao configurar worker do PDF.js:", workerResult.error);
      // Don't show a toast here as configurePdfWorker already does
    }
  }, []);

  return (
    <div className="border rounded-lg p-6 bg-white shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Upload de Documento</h2>
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Input 
            type="file" 
            accept=".pdf,.docx,.txt" 
            onChange={handleFileChange}
            disabled={isUploading}
          />
          <Button 
            onClick={handleUpload} 
            disabled={!selectedFile || isUploading}
            className="shrink-0"
          >
            {isUploading ? "Processando..." : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload
              </>
            )}
          </Button>
        </div>
        
        {/* File preview component */}
        {selectedFile && (
          <div className="mt-4">
            <DocumentFilePreview file={selectedFile} />
          </div>
        )}
        
        <div className="text-sm text-muted-foreground">
          <p>Formatos aceitos: PDF, DOCX, TXT</p>
          <p>Tamanho máximo: 10MB</p>
        </div>
      </div>
    </div>
  );
};

export default DocumentUploader;
