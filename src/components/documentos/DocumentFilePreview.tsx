
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import ImagePreview from './previews/ImagePreview';
import PdfPreview from './previews/PdfPreview';
import GenericFilePreview from './previews/GenericFilePreview';
import FileDetails from './previews/FileDetails';
import { generatePdfPreview } from '@/utils/pdf/pdfPreviewGenerator';
import { configurePdfWorker, preloadPdfWorker } from '@/utils/pdf/pdfWorkerConfig';
import { toast } from "sonner";

interface DocumentFilePreviewProps {
  file: File | null;
}

const DocumentFilePreview: React.FC<DocumentFilePreviewProps> = ({ file }) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [pdfFirstPage, setPdfFirstPage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Configure PDF.js worker when component mounts with improved configuration
  useEffect(() => {
    // Configura o worker com múltiplos fallbacks
    const workerResult = configurePdfWorker({ 
      verbose: true,
      showToasts: true,
      useLocalWorker: true // Tenta usar worker local primeiro
    });
    
    if (!workerResult.success) {
      console.error("PDF worker configuration failed:", workerResult.error);
    }
    
    return () => {
      // Clean up any preview URLs when component unmounts
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, []);

  // Clean up URL objects when file changes
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
          // Ensure worker is configured before generating preview
          // Tente múltiplas estratégias para configurar o worker
          const workerConfig = configurePdfWorker({ 
            verbose: true, 
            showToasts: false,
            useLocalWorker: true
          });
          
          // Se nenhuma estratégia normal funcionar, tenta usar worker fake
          if (!workerConfig.success) {
            console.warn("Tentando worker fake como alternativa...");
            // Último recurso: worker fake (dentro da função getDocument)
          }
          
          // Tenta gerar preview mesmo se worker falhar (pode usar fallback interno)
          const previewImage = await generatePdfPreview(file, {
            verbose: true,
            showToasts: false, // Don't show toasts for preview issues
            scale: 0.5,
            timeout: 25000 // Increased timeout for larger PDFs
          });
          setPdfFirstPage(previewImage);
        } catch (error) {
          setError(error instanceof Error ? error.message : "Unknown error");
          console.error("Falha ao gerar visualização do PDF:", error);
          
          // No toast here - we'll just show the PDF icon instead
          // Don't need to alert the user about preview issues if they can still upload
          
          // Try an alternative approach - just show the icon
          setPdfFirstPage(null);
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

  // Show error state but still allow continuing with the upload
  if (error && file.type === 'application/pdf') {
    return (
      <Card className="overflow-hidden">
        <CardContent className="p-4">
          <div className="flex flex-col items-center">
            <PdfPreview previewImage={null} fileName={file.name} />
            <FileDetails name={file.name} size={file.size} />
            <p className="text-sm text-amber-600 mt-2">
              Não foi possível gerar visualização, mas você ainda pode fazer upload do arquivo.
            </p>
          </div>
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
