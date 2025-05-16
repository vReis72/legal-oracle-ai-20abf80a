
import * as pdfjsLib from 'pdfjs-dist';
import { configurePdfWorker } from './pdfWorkerConfig';
import { toast } from "sonner";

/**
 * Generates a preview image from the first page of a PDF file
 * @param file PDF file to generate preview from
 * @returns A data URL containing the preview image or null if preview generation failed
 * @throws Error if preview generation fails
 */
export const generatePdfPreview = async (file: File): Promise<string | null> => {
  try {
    // Configure PDF.js worker
    const workerConfigured = configurePdfWorker();
    if (!workerConfigured) {
      console.error("PDF worker not configured properly");
      throw new Error("PDF worker configuration failed");
    }
    
    console.log("Generating PDF preview for:", file.name);
    
    // Load the PDF file
    const arrayBuffer = await file.arrayBuffer();
    
    if (!arrayBuffer || arrayBuffer.byteLength === 0) {
      throw new Error("PDF file is empty or corrupted");
    }
    
    console.log("PDF ArrayBuffer loaded, size:", arrayBuffer.byteLength, "bytes");
    
    // Create a loading task with additional options
    const loadingTask = pdfjsLib.getDocument({
      data: arrayBuffer,
      cMapUrl: 'https://unpkg.com/pdfjs-dist@latest/cmaps/',
      cMapPacked: true,
    });
    
    // Set a timeout for PDF loading
    const pdfDoc = await Promise.race([
      loadingTask.promise,
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error("PDF loading timeout")), 10000)
      )
    ]) as pdfjsLib.PDFDocumentProxy;
    
    console.log("PDF loaded, pages:", pdfDoc.numPages);
    
    // If the PDF has no pages, return null
    if (pdfDoc.numPages <= 0) {
      return null;
    }
    
    // Get the first page
    const page = await pdfDoc.getPage(1);
    
    // Create a canvas with appropriate size
    const canvas = document.createElement('canvas');
    const viewport = page.getViewport({ scale: 0.5 }); // Scale down for preview
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error("Could not get canvas context");
    }
    
    const renderContext = {
      canvasContext: ctx,
      viewport: viewport,
    };
    
    // Render the page
    await page.render(renderContext).promise;
    
    // Convert canvas to data URL
    const dataUrl = canvas.toDataURL('image/png');
    console.log("PDF preview generated successfully");
    
    return dataUrl;
  } catch (error) {
    console.error('Error generating PDF preview:', error);
    // More descriptive error message
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    toast.error(`Falha ao gerar visualização do PDF: ${errorMessage}`);
    throw new Error(`Could not generate PDF preview: ${errorMessage}`);
  }
};
