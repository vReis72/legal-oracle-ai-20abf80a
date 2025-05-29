
import * as pdfjsLib from 'pdfjs-dist';
import { toast } from "sonner";

/**
 * Options for configuring the PDF worker
 */
interface PdfWorkerConfigOptions {
  /** Whether to show toast notifications for errors */
  showToasts?: boolean;
  /** Whether to use verbose logging */
  verbose?: boolean;
}

/**
 * Result of configuring the PDF worker
 */
interface PdfWorkerConfigResult {
  /** Whether configuration was successful */
  success: boolean;
  /** The worker source URL that was configured */
  workerSrc?: string;
  /** Error message if configuration failed */
  error?: string;
}

/**
 * Configura o worker do PDF.js de forma simples e confiável
 */
export const configurePdfWorker = (options: PdfWorkerConfigOptions = {}): PdfWorkerConfigResult => {
  const { showToasts = true, verbose = false } = options;
  
  try {
    // Check if worker is already configured
    if (isPdfWorkerConfigured()) {
      if (verbose) {
        console.log(`[PDF Worker]: Já configurado - ${pdfjsLib.GlobalWorkerOptions.workerSrc}`);
      }
      return { 
        success: true, 
        workerSrc: pdfjsLib.GlobalWorkerOptions.workerSrc 
      };
    }
    
    // Use the most reliable CDN (jsDelivr)
    const workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;
    
    // Configure the worker
    pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;
    
    if (verbose) {
      console.log(`[PDF Worker]: Configurado com sucesso - ${workerSrc}`);
    }
    
    return { 
      success: true, 
      workerSrc 
    };
  } catch (error) {
    const errorMessage = error instanceof Error 
      ? error.message 
      : "Erro desconhecido na configuração do worker";
    
    console.error(`[PDF Worker Error]: ${errorMessage}`);
    
    if (showToasts) {
      toast.error(`Erro na configuração do PDF: ${errorMessage}`);
    }
    
    return {
      success: false,
      error: errorMessage
    };
  }
};

/**
 * Check if PDF.js worker is properly configured
 */
export const isPdfWorkerConfigured = (): boolean => {
  return !!pdfjsLib.GlobalWorkerOptions.workerSrc;
};

/**
 * Pré-carrega o worker do PDF.js
 */
export const preloadPdfWorker = (): void => {
  setTimeout(() => {
    configurePdfWorker({ verbose: true, showToasts: false });
  }, 0);
};
