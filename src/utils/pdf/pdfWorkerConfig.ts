
import * as pdfjsLib from 'pdfjs-dist';

interface WorkerConfigResult {
  success: boolean;
  error?: string;
  workerSrc?: string;
}

/**
 * Configuração simplificada do worker PDF.js
 * Evita loops e problemas de travamento
 */
export const configurePdfWorker = (): WorkerConfigResult => {
  try {
    // Configuração direta e simples
    const workerUrl = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;
    pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;
    return {
      success: true,
      workerSrc: workerUrl
    };
  } catch (error) {
    console.error('Erro ao configurar PDF worker:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

export const isPdfWorkerConfigured = (): boolean => {
  return !!pdfjsLib.GlobalWorkerOptions.workerSrc;
};

export const preloadPdfWorker = (): void => {
  configurePdfWorker();
};
