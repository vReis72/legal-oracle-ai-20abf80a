
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
 * Configura o PDF.js para funcionar sem worker externo usando fallback
 */
export const configurePdfWorker = (options: PdfWorkerConfigOptions = {}): PdfWorkerConfigResult => {
  const { showToasts = true, verbose = false } = options;
  
  try {
    // Configurar para usar fallback interno (compatível com PDF.js 5.x)
    // Usar 'false' força o uso do processamento síncrono interno
    pdfjsLib.GlobalWorkerOptions.workerSrc = false as any;
    
    if (verbose) {
      console.log('[PDF Worker]: Configurado para usar fallback interno (processamento síncrono)');
    }
    
    return { 
      success: true, 
      workerSrc: 'fallback-interno'
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
