
import * as pdfjsLib from 'pdfjs-dist';

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
 * Configura o worker do PDF.js de forma mais simples
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
    
    // Use a simpler approach - let PDF.js handle the worker internally
    // This avoids external CDN dependencies that can fail
    pdfjsLib.GlobalWorkerOptions.workerSrc = '';
    
    if (verbose) {
      console.log(`[PDF Worker]: Configurado para usar worker interno`);
    }
    
    return { 
      success: true, 
      workerSrc: 'internal'
    };
  } catch (error) {
    const errorMessage = error instanceof Error 
      ? error.message 
      : "Erro desconhecido na configuração do worker";
    
    console.error(`[PDF Worker Error]: ${errorMessage}`);
    
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
  return pdfjsLib.GlobalWorkerOptions.workerSrc !== undefined;
};
