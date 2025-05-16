
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
  /** Whether to use a local worker from node_modules (default: false) */
  useLocalWorker?: boolean;
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
  const { 
    showToasts = true, 
    verbose = false, 
    customCdnUrl,
    useLocalWorker = false
  } = options;
  
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
    
    // Check if worker is already configured
    if (isPdfWorkerConfigured()) {
      logInfo("Worker já configurado anteriormente, usando configuração existente.");
      return { 
        success: true, 
        workerSrc: pdfjsLib.GlobalWorkerOptions.workerSrc 
      };
    }
    
    // Define worker source options, starting with most reliable
    let workerSrc: string;
    
    // Try these options in order:
    // 1. Use bundled worker (most reliable in production)
    try {
      // This works with Vite's import.meta.url
      if (typeof window === 'object' && 'pdfjsWorker' in window) {
        // If the app has already registered the worker on the window
        workerSrc = (window as any).pdfjsWorker;
        logInfo(`Usando worker registrado no window: ${workerSrc}`);
      } else {
        // Try to use webpack/vite-aware URL path
        const workerUrl = new URL('pdfjs-dist/build/pdf.worker.min.js', import.meta.url);
        workerSrc = workerUrl.href;
        logInfo(`Usando worker do bundle: ${workerSrc}`);
      }
    } catch (e) {
      logInfo("Não foi possível usar o worker local. Tentando CDNs...");
      
      // 2. Try CDNs in order of reliability
      const cdnOptions = [
        // Direct path relative to the site root (most reliable in production)
        `${window.location.origin}/assets/pdf.worker.min.js`,
        `${window.location.origin}/pdf.worker.min.js`,
        // CDN options
        `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`,
        `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`,
        `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`
      ];
      
      // Use the custom CDN if provided, otherwise use the first CDN option
      workerSrc = customCdnUrl 
        ? customCdnUrl.replace('{{version}}', pdfjsLib.version)
        : cdnOptions[0];
      
      logInfo(`Usando CDN para worker: ${workerSrc}`);
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
    
    // As a last resort, try to use a fake worker (will be slow but might work)
    try {
      logInfo("Tentando configurar worker fake como última alternativa");
      // Set to empty string to use the fake worker
      pdfjsLib.GlobalWorkerOptions.workerSrc = '';
      
      return {
        success: true,
        workerSrc: 'fake-worker',
        error: `Aviso: Usando worker fake (processamento mais lento). Erro original: ${errorMessage}`
      };
    } catch (fakeWorkerError) {
      return {
        success: false,
        error: `${errorMessage}. Também falhou ao configurar worker fake.`
      };
    }
  }
};

/**
 * Check if PDF.js worker is properly configured
 * @returns true if worker is configured, false otherwise
 */
export const isPdfWorkerConfigured = (): boolean => {
  return !!pdfjsLib.GlobalWorkerOptions.workerSrc;
};
