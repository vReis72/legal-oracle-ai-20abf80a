
import * as pdfjsLib from 'pdfjs-dist';

/**
 * Configuração simplificada do worker PDF.js
 * Evita loops e problemas de travamento
 */
export const configurePdfWorker = (): boolean => {
  try {
    // Configuração direta e simples
    const workerUrl = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;
    pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;
    return true;
  } catch (error) {
    console.error('Erro ao configurar PDF worker:', error);
    return false;
  }
};

export const isPdfWorkerConfigured = (): boolean => {
  return !!pdfjsLib.GlobalWorkerOptions.workerSrc;
};

export const preloadPdfWorker = (): void => {
  configurePdfWorker();
};
