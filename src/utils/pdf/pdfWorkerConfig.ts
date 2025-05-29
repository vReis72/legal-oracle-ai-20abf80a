
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
 * Configura o worker do PDF.js para usar o arquivo local
 */
export const configurePdfWorker = (options: PdfWorkerConfigOptions = {}): PdfWorkerConfigResult => {
  const { showToasts = true, verbose = false } = options;
  
  try {
    // Usar o worker local do pacote pdfjs-dist
    // O Vite automaticamente resolve este caminho
    const workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.js', import.meta.url).toString();
    pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;
    
    if (verbose) {
      console.log('[PDF Worker]: Configurado com worker local:', workerSrc);
    }
    
    return { 
      success: true, 
      workerSrc: workerSrc
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
  return pdfjsLib.GlobalWorkerOptions.workerSrc !== undefined && 
         pdfjsLib.GlobalWorkerOptions.workerSrc !== null;
};
