
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
    
    // ESTRATÉGIA 1: Verificar worker no window
    if (typeof window === 'object' && 'pdfjsWorker' in window) {
      // Se a app já registrou o worker no window
      workerSrc = (window as any).pdfjsWorker;
      logInfo(`Usando worker registrado no window: ${workerSrc}`);
    } else {
      // ESTRATÉGIA 2: Verificar caminhos locais
      if (typeof window === 'object') {
        const possiblePaths = [
          `${window.location.origin}/pdf.worker.min.js`,
          `${window.location.origin}/assets/pdf.worker.min.js`,
          `${window.location.origin}/static/pdf.worker.min.js`,
          // Adicione mais caminhos conforme necessário
        ];
        
        // Testar caminhos locais assincronamente (mas sem bloquear)
        possiblePaths.forEach(path => {
          fetch(path, { method: 'HEAD' })
            .then(response => {
              if (response.ok && !isPdfWorkerConfigured()) {
                logInfo(`Worker encontrado em: ${path}`);
                pdfjsLib.GlobalWorkerOptions.workerSrc = path;
                // Registra para uso futuro
                (window as any).pdfjsWorkerSrc = path;
              }
            })
            .catch(() => {
              // Silenciosamente falha em cada tentativa
            });
        });
      }
      
      // ESTRATÉGIA 3: Usar CDNs
      // List of CDN options in order of preference
      const cdnOptions = [
        `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`,
        `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`,
        `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`
      ];
      
      // Use custom CDN if provided, otherwise use the first CDN option
      workerSrc = customCdnUrl 
        ? customCdnUrl.replace('{{version}}', pdfjsLib.version)
        : cdnOptions[0];
      
      logInfo(`Usando CDN para worker: ${workerSrc}`);
    }
    
    // Configure the worker
    pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;
    
    // Store for future reference
    if (typeof window === 'object') {
      (window as any).pdfjsWorkerSrc = workerSrc;
    }
    
    logInfo(`Worker do PDF.js configurado com sucesso via ${workerSrc}`);
    
    // Testar carregamento do worker (não bloqueia)
    if (typeof window === 'object') {
      const testScript = document.createElement('script');
      testScript.src = workerSrc;
      testScript.id = 'pdf-worker-test';
      testScript.onload = () => {
        logInfo('Worker carregado com sucesso');
        document.head.removeChild(testScript);
      };
      testScript.onerror = () => {
        logError('Falha ao carregar worker, tentando worker fake');
        document.head.removeChild(testScript);
        // Último recurso: worker fake
        pdfjsLib.GlobalWorkerOptions.workerSrc = '';
        if (typeof window === 'object') {
          (window as any).pdfjsWorkerSrc = 'fake-worker';
        }
      };
      document.head.appendChild(testScript);
    }
    
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

/**
 * Pré-carrega o worker do PDF.js para garantir disponibilidade
 * quando necessário para processamento de PDFs
 */
export const preloadPdfWorker = (): void => {
  // Tentar carregar o worker com múltiplas estratégias
  setTimeout(() => {
    console.log("[PDF.js] Pré-carregando worker...");
    
    configurePdfWorker({
      verbose: true,
      showToasts: false, // Não mostrar toasts durante pré-carregamento
      useLocalWorker: true
    });
    
    // Verificar configuração após um tempo
    setTimeout(() => {
      const isConfigured = isPdfWorkerConfigured();
      console.log(`[PDF.js] Status do worker após pré-carregamento: ${isConfigured ? 'Configurado' : 'Não configurado'}`);
      if (isConfigured) {
        console.log(`[PDF.js] Worker src: ${pdfjsLib.GlobalWorkerOptions.workerSrc}`);
      }
      
      // Se falhar, tentar estratégia alternativa
      if (!isConfigured) {
        console.warn("[PDF.js] Tentando estratégia alternativa de carregamento");
        
        // Tenta usar worker fake como último recurso
        pdfjsLib.GlobalWorkerOptions.workerSrc = '';
        console.log("[PDF.js] Configurado worker fake como fallback");
      }
    }, 1000);
  }, 0);
};
