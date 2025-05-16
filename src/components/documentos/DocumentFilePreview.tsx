
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import ImagePreview from './previews/ImagePreview';
import PdfPreview from './previews/PdfPreview';
import GenericFilePreview from './previews/GenericFilePreview';
import FileDetails from './previews/FileDetails';
import { generatePdfPreview } from '@/utils/pdf/pdfPreviewGenerator';

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
      const handlePdfPreview = async () => {
        try {
          const previewImage = await generatePdfPreview(file);
          setPdfFirstPage(previewImage);
        } catch (error) {
          setError(error instanceof Error ? error.message : "Unknown error");
        } finally {
          setIsLoading(false);
        }
      };
      
      handlePdfPreview();
    } 
    // For other file types, just indicate the type
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
      <Card className="h-40 flex items-center justify-center bg-red-50">
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
            <ImagePreview src={previewUrl} alt={file.name} />
          )}
          
          {/* Show PDF preview */}
          {file.type === 'application/pdf' && (
            <PdfPreview previewImage={pdfFirstPage} fileName={file.name} />
          )}
          
          {/* Show generic file preview for other types */}
          {!file.type.startsWith('image/') && 
           file.type !== 'application/pdf' && (
            <GenericFilePreview fileType={file.type} />
          )}
          
          {/* Show file details for all types */}
          <FileDetails name={file.name} size={file.size} />
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentFilePreview;
