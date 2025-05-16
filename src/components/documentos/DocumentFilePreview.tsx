
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { FileText, File, FileImage } from "lucide-react";
import * as pdfjsLib from 'pdfjs-dist';
import { configurePdfWorker } from "@/utils/pdf/pdfWorkerConfig";

interface DocumentFilePreviewProps {
  file: File | null;
}

const DocumentFilePreview: React.FC<DocumentFilePreviewProps> = ({ file }) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [pdfFirstPage, setPdfFirstPage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Clean up URL objects when component unmounts or file changes
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Generate preview when file changes
  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      setPdfFirstPage(null);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    // For images, create a preview URL
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setIsLoading(false);
    } 
    // For PDFs, generate a preview of the first page
    else if (file.type === 'application/pdf') {
      const generatePdfPreview = async () => {
        try {
          // Configure PDF.js worker if needed
          configurePdfWorker();
          
          // Load the PDF file
          const arrayBuffer = await file.arrayBuffer();
          const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
          const pdfDoc = await loadingTask.promise;
          
          // Get the first page
          if (pdfDoc.numPages > 0) {
            const page = await pdfDoc.getPage(1);
            
            // Render the page to a canvas
            const canvas = document.createElement('canvas');
            const viewport = page.getViewport({ scale: 0.5 }); // Scale down for preview
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            
            const renderContext = {
              canvasContext: canvas.getContext('2d')!,
              viewport: viewport,
            };
            
            await page.render(renderContext).promise;
            
            // Convert canvas to data URL
            const dataUrl = canvas.toDataURL('image/png');
            setPdfFirstPage(dataUrl);
          }
          setIsLoading(false);
        } catch (err) {
          console.error('Error generating PDF preview:', err);
          setError('Could not generate PDF preview');
          setIsLoading(false);
        }
      };
      
      generatePdfPreview();
    } 
    // For text files, just indicate it's a text file
    else if (file.type === 'text/plain') {
      setIsLoading(false);
    } 
    // For other file types, just show generic file icon
    else {
      setIsLoading(false);
    }
  }, [file]);

  // If no file is selected
  if (!file) {
    return (
      <Card className="bg-muted/50 border-dashed h-40 flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <p>Nenhum arquivo selecionado</p>
        </div>
      </Card>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <Card className="h-40 flex items-center justify-center">
        <CardContent className="p-4 text-center">
          <div className="animate-pulse">
            <p className="text-muted-foreground">Gerando visualização...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show error state
  if (error) {
    return (
      <Card className="h-40 flex items-center justify-center">
        <CardContent className="p-4 text-center text-destructive">
          <p>{error}</p>
        </CardContent>
      </Card>
    );
  }

  // Render preview based on file type
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex flex-col items-center">
          {/* Show image preview */}
          {file.type.startsWith('image/') && previewUrl && (
            <div className="flex flex-col items-center">
              <div className="relative w-full h-32 mb-2">
                <img 
                  src={previewUrl} 
                  alt={file.name} 
                  className="object-contain w-full h-full"
                />
              </div>
            </div>
          )}
          
          {/* Show PDF preview */}
          {file.type === 'application/pdf' && pdfFirstPage && (
            <div className="flex flex-col items-center">
              <div className="relative w-full h-32 mb-2">
                <img 
                  src={pdfFirstPage} 
                  alt={`Primeira página de ${file.name}`}
                  className="object-contain w-full h-full"
                />
              </div>
            </div>
          )}
          
          {/* Show text file icon */}
          {file.type === 'text/plain' && (
            <div className="flex flex-col items-center">
              <FileText size={64} className="text-blue-500 mb-2" />
            </div>
          )}
          
          {/* Show DOCX file icon */}
          {file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' && (
            <div className="flex flex-col items-center">
              <FileText size={64} className="text-blue-600 mb-2" />
            </div>
          )}
          
          {/* Show generic file icon for other types */}
          {!file.type.startsWith('image/') && 
           file.type !== 'application/pdf' && 
           file.type !== 'text/plain' &&
           file.type !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' && (
            <div className="flex flex-col items-center">
              <File size={64} className="text-gray-500 mb-2" />
            </div>
          )}
          
          {/* Show file name for all types */}
          <p className="text-sm text-center font-medium mt-2 truncate max-w-full">
            {file.name}
          </p>
          <p className="text-xs text-muted-foreground">
            {(file.size / 1024).toFixed(1)} KB
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentFilePreview;
