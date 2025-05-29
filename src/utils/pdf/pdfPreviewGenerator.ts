
import * as pdfjsLib from 'pdfjs-dist';
import { configurePdfWorker } from './pdfWorkerConfig';

interface PdfPreviewOptions {
  scale?: number;
  timeout?: number;
  verbose?: boolean;
  showToasts?: boolean;
}

/**
 * Gera preview da primeira página de um PDF de forma mais simples
 */
export const generatePdfPreview = async (
  file: File,
  options: PdfPreviewOptions = {}
): Promise<string | null> => {
  const {
    scale = 0.5,
    timeout = 10000, // Timeout menor para preview
    verbose = false
  } = options;
  
  try {
    // Configurar worker de forma simples
    configurePdfWorker({ verbose, showToasts: false });
    
    if (verbose) console.log("Gerando preview para:", file.name);
    
    // Carregar PDF
    const arrayBuffer = await file.arrayBuffer();
    if (!arrayBuffer || arrayBuffer.byteLength === 0) {
      return null;
    }
    
    const loadingTask = pdfjsLib.getDocument({
      data: arrayBuffer,
      verbosity: 0
    });
    
    const pdfDoc = await Promise.race([
      loadingTask.promise,
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error("Timeout")), timeout)
      )
    ]);
    
    if (pdfDoc.numPages <= 0) {
      return null;
    }
    
    // Renderizar primeira página
    const page = await pdfDoc.getPage(1);
    const canvas = document.createElement('canvas');
    const viewport = page.getViewport({ scale });
    
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return null;
    }
    
    await page.render({
      canvasContext: ctx,
      viewport: viewport,
    }).promise;
    
    if (verbose) console.log("Preview gerado com sucesso");
    
    return canvas.toDataURL('image/png');
  } catch (error) {
    if (verbose) {
      console.warn('Preview falhou, mas continuando:', error);
    }
    return null;
  }
};
