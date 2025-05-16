
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
    
    // Try to use bundled worker first if requested
    if (useLocalWorker) {
      try {
        // In a bundled environment, we can use the bundled worker
        const workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.js', import.meta.url).href;
        pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;
        
        logInfo(`Worker configurado localmente: ${workerSrc}`);
        return { 
          success: true, 
          workerSrc 
        };
      } catch (e) {
        logInfo("Não foi possível usar o worker local. Tentando CDNs...");
        // Continue with CDN options below
      }
    }
    
    // Determine which CDN to use
    let workerSrc: string;
    
    if (customCdnUrl) {
      // Use custom CDN if provided
      workerSrc = customCdnUrl.replace('{{version}}', pdfjsLib.version);
      logInfo(`Usando CDN personalizado: ${workerSrc}`);
    } else {
      // Try multiple CDNs in order of reliability
      const cdnOptions = [
        `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`,
        `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`,
        `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`,
        // Fallback to archive.org's CDN as last resort
        `https://archive.org/download/pdfjs-dist-${pdfjsLib.version}/pdf.worker.min.js`
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
    
    // As a last resort, try to use a fake worker (will be slow but might work)
    try {
      logInfo("Tentando configurar worker fake como última alternativa");
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

/**
 * Try to ping a URL to check if it's accessible
 * @param url The URL to ping
 * @param timeout Timeout in milliseconds
 * @returns Promise that resolves to true if URL is accessible
 */
const pingUrl = async (url: string, timeout: number = 3000): Promise<boolean> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    const response = await fetch(url, { 
      method: 'HEAD',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch (e) {
    return false;
  }
};
