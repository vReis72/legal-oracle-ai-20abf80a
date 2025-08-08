
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
    
    // ESTRATÉGIA SIMPLIFICADA: Usar apenas CDN confiável
    const cdnWorkerUrl = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;
    
    logInfo(`Configurando worker via CDN: ${cdnWorkerUrl}`);
    
    // Configure the worker directly
    pdfjsLib.GlobalWorkerOptions.workerSrc = cdnWorkerUrl;
    
    // Store for future reference
    if (typeof window === 'object') {
      (window as any).pdfjsWorkerSrc = cdnWorkerUrl;
    }
    
    logInfo(`Worker do PDF.js configurado com sucesso via CDN`);
    
    return { 
      success: true, 
      workerSrc: cdnWorkerUrl 
    };
  } catch (error) {
    const errorMessage = error instanceof Error 
      ? error.message 
      : "Erro desconhecido na configuração do worker";
    
    logError(errorMessage, error);
    
    // Simple fallback to the most common CDN URL
    try {
      logInfo("Tentando configurar fallback CDN");
      const fallbackUrl = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;
      pdfjsLib.GlobalWorkerOptions.workerSrc = fallbackUrl;
      
      return {
        success: true,
        workerSrc: fallbackUrl,
        error: `Aviso: Usando CDN fallback. Erro original: ${errorMessage}`
      };
    } catch (fallbackError) {
      return {
        success: false,
        error: `${errorMessage}. Também falhou ao configurar CDN fallback.`
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
 * Pré-carrega o worker do PDF.js para garantir disponibilidade
 * quando necessário para processamento de PDFs
 */
export const preloadPdfWorker = (): void => {
  // Configuração simplificada do worker
  setTimeout(() => {
    console.log("[PDF.js] Pré-carregando worker...");
    
    const result = configurePdfWorker({
      verbose: false,
      showToasts: false, // Não mostrar toasts durante pré-carregamento
    });
    
    if (result.success) {
      console.log(`[PDF.js] Worker pré-carregado com sucesso: ${result.workerSrc}`);
    } else {
      console.warn(`[PDF.js] Falha no pré-carregamento: ${result.error}`);
    }
  }, 100);
};
