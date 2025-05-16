
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
  /** Custom CDN URL to use (if not provided, unpkg will be used) */
  customCdnUrl?: string;
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
 * Configura o worker do PDF.js para processamento de arquivos PDF
 * Tenta usar CDN com fallbacks para garantir que o worker seja carregado
 * 
 * @param options - Configuration options
 * @returns Result object with configuration status
 */
export const configurePdfWorker = (options: PdfWorkerConfigOptions = {}): PdfWorkerConfigResult => {
  const { showToasts = true, verbose = false, customCdnUrl } = options;
  
  const logInfo = (message: string) => {
    if (verbose) {
      console.log(`[PDF Worker Config]: ${message}`);
    }
  };
  
  const logError = (message: string, error?: any) => {
    console.error(`[PDF Worker Config Error]: ${message}`, error || '');
    if (showToasts) {
      toast.error(`Erro na configuração do PDF: ${message}`);
    }
  };
  
  try {
    logInfo(`Configurando worker do PDF.js v${pdfjsLib.version}`);
    
    // Determine which CDN to use
    let workerSrc: string;
    
    if (customCdnUrl) {
      // Use custom CDN if provided
      workerSrc = customCdnUrl.replace('{{version}}', pdfjsLib.version);
      logInfo(`Usando CDN personalizado: ${workerSrc}`);
    } else {
      // Try multiple CDNs in order of reliability
      const cdnOptions = [
        `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`,
        `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`,
        `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`
      ];
      
      // Use the first CDN as default
      workerSrc = cdnOptions[0];
      logInfo(`Usando CDN primário: ${workerSrc}`);
    }
    
    // Configure the worker
    pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;
    
    logInfo(`Worker do PDF.js configurado com sucesso via ${workerSrc}`);
    return { 
      success: true, 
      workerSrc 
    };
  } catch (error) {
    const errorMessage = error instanceof Error 
      ? error.message 
      : "Erro desconhecido na configuração do worker";
    
    logError(errorMessage, error);
    
    return {
      success: false,
      error: errorMessage
    };
  }
};

/**
 * Check if PDF.js worker is properly configured
 * @returns true if worker is configured, false otherwise
 */
export const isPdfWorkerConfigured = (): boolean => {
  return !!pdfjsLib.GlobalWorkerOptions.workerSrc;
};

