
import * as pdfjsLib from 'pdfjs-dist';
import { configurePdfWorker, isPdfWorkerConfigured } from './pdfWorkerConfig';
import { toast } from "sonner";

interface PdfPreviewOptions {
  /** Scale for the preview image (default: 0.5) */
  scale?: number;
  /** Timeout for PDF loading in ms (default: 10000) */
  timeout?: number;
  /** Whether to show verbose logs */
  verbose?: boolean;
  /** Whether to show toast notifications */
  showToasts?: boolean;
}

/**
 * Generates a preview image from the first page of a PDF file
 * @param file PDF file to generate preview from
 * @param options Preview generation options
 * @returns A data URL containing the preview image or null if preview generation failed
 * @throws Error if preview generation fails
 */
export const generatePdfPreview = async (
  file: File,
  options: PdfPreviewOptions = {}
): Promise<string | null> => {
  const {
    scale = 0.5,
    timeout = 10000,
    verbose = true,
    showToasts = true
  } = options;
  
  try {
    // Configure PDF.js worker if not already configured
    if (!isPdfWorkerConfigured()) {
      const workerResult = configurePdfWorker();
      
      if (!workerResult.success) {
        throw new Error(`PDF worker configuration failed: ${workerResult.error}`);
      }
      
      if (verbose) {
        console.log("PDF worker configured:", workerResult.workerSrc);
      }
    }
    
    if (verbose) console.log("Generating PDF preview for:", file.name);
    
    // Load the PDF file
    const arrayBuffer = await file.arrayBuffer();
    
    if (!arrayBuffer || arrayBuffer.byteLength === 0) {
      throw new Error("PDF file is empty or corrupted");
    }
    
    if (verbose) console.log("PDF ArrayBuffer loaded, size:", arrayBuffer.byteLength, "bytes");
    
    // Create a loading task with additional options
    const loadingTask = pdfjsLib.getDocument({
      data: arrayBuffer,
      cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@latest/cmaps/',
      cMapPacked: true,
      // Add option to disable range requests which might be causing issues
      disableRange: true,
      // Add option to disable streams which might be causing issues
      disableStream: true
    });
    
    // Set a timeout for PDF loading
    const pdfDoc = await Promise.race([
      loadingTask.promise,
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error("PDF loading timeout")), timeout)
      )
    ]) as pdfjsLib.PDFDocumentProxy;
    
    if (verbose) console.log("PDF loaded, pages:", pdfDoc.numPages);
    
    // If the PDF has no pages, return null
    if (pdfDoc.numPages <= 0) {
      return null;
    }
    
    // Get the first page
    const page = await pdfDoc.getPage(1);
    
    // Create a canvas with appropriate size
    const canvas = document.createElement('canvas');
    const viewport = page.getViewport({ scale });
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
    if (verbose) console.log("PDF preview generated successfully");
    
    return dataUrl;
  } catch (error) {
    if (verbose) console.error('Error generating PDF preview:', error);
    
    // More descriptive error message
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    if (showToasts) {
      toast.error(`Falha ao gerar visualização do PDF: ${errorMessage}`);
    }
    
    throw new Error(`Could not generate PDF preview: ${errorMessage}`);
  }
};
