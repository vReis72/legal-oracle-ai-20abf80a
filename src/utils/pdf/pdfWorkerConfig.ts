
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
 * Configura o worker do PDF.js usando o worker local
 */
export const configurePdfWorker = (options: PdfWorkerConfigOptions = {}): PdfWorkerConfigResult => {
  const { showToasts = true, verbose = false } = options;
  
  try {
    // Verificar se já está configurado
    if (pdfjsLib.GlobalWorkerOptions.workerSrc) {
      if (verbose) {
        console.log(`[PDF Worker]: Já configurado - ${pdfjsLib.GlobalWorkerOptions.workerSrc}`);
      }
      return { 
        success: true, 
        workerSrc: pdfjsLib.GlobalWorkerOptions.workerSrc 
      };
    }
    
    // Usar o worker local do pacote pdfjs-dist
    // Isso evita problemas com CDNs externas
    const workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.js', import.meta.url).href;
    pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;
    
    if (verbose) {
      console.log(`[PDF Worker]: Configurado com worker local - ${workerSrc}`);
    }
    
    return { 
      success: true, 
      workerSrc: workerSrc
    };
  } catch (error) {
    if (verbose) {
      console.warn('[PDF Worker]: Tentativa com worker local falhou, usando fallback');
    }
    
    // Fallback: deixar vazio para usar processamento interno
    try {
      pdfjsLib.GlobalWorkerOptions.workerSrc = '';
      if (verbose) {
        console.log(`[PDF Worker]: Fallback - usando processamento interno`);
      }
      return { 
        success: true, 
        workerSrc: 'internal'
      };
    } catch (fallbackError) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Erro desconhecido na configuração do worker";
      
      console.error(`[PDF Worker Error]: ${errorMessage}`);
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }
};

/**
 * Check if PDF.js worker is properly configured
 */
export const isPdfWorkerConfigured = (): boolean => {
  return pdfjsLib.GlobalWorkerOptions.workerSrc !== undefined && 
         pdfjsLib.GlobalWorkerOptions.workerSrc !== null;
};
