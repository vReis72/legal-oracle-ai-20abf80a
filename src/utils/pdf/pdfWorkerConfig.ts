
import * as pdfjsLib from 'pdfjs-dist';

/**
 * Configura o worker do PDF.js para processamento de arquivos PDF
 * Tenta primeiro usar o worker empacotado, com fallback para CDN
 * @returns boolean indicando se a configuração foi bem-sucedida
 */
export const configurePdfWorker = (): boolean => {
  try {
    // Opção 1: Usar CDN com versão específica (mais confiável)
    const pdfWorkerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;
    pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerSrc;
    console.log(`PDF.js Worker configurado via CDN unpkg: versão ${pdfjsLib.version}`);
    return true;
  } catch (error) {
    console.error("Erro na configuração do worker:", error);
    return false;
  }
};
