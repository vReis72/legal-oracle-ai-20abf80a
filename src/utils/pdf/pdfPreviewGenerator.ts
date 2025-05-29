
import * as pdfjsLib from 'pdfjs-dist';
import { configurePdfWorker, isPdfWorkerConfigured } from './pdfWorkerConfig';

interface PdfPreviewOptions {
  scale?: number;
  timeout?: number;
  verbose?: boolean;
  showToasts?: boolean;
}

/**
 * Gera preview da primeira página de um PDF de forma simplificada
 */
export const generatePdfPreview = async (
  file: File,
  options: PdfPreviewOptions = {}
): Promise<string | null> => {
  const {
    scale = 0.5,
    timeout = 15000, // Timeout menor para preview
    verbose = false,
    showToasts = false
  } = options;
  
  try {
    // Configurar worker se necessário
    if (!isPdfWorkerConfigured()) {
      const workerResult = configurePdfWorker({ verbose, showToasts });
      if (!workerResult.success) {
        throw new Error("Falha ao configurar worker PDF");
      }
    }
    
    if (verbose) console.log("Gerando preview para:", file.name);
    
    // Carregar PDF
    const arrayBuffer = await file.arrayBuffer();
    if (!arrayBuffer || arrayBuffer.byteLength === 0) {
      throw new Error("Arquivo PDF vazio");
    }
    
    const loadingTask = pdfjsLib.getDocument({
      data: arrayBuffer,
      disableRange: true,
      disableStream: true
    });
    
    const pdfDoc = await Promise.race([
      loadingTask.promise,
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error("Timeout")), timeout)
      )
    ]) as pdfjsLib.PDFDocumentProxy;
    
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
      throw new Error("Falha ao obter contexto do canvas");
    }
    
    await page.render({
      canvasContext: ctx,
      viewport: viewport,
    }).promise;
    
    if (verbose) console.log("Preview gerado com sucesso");
    
    return canvas.toDataURL('image/png');
  } catch (error) {
    if (verbose) {
      console.error('Erro ao gerar preview:', error);
    }
    
    // Não mostrar toast para falhas de preview - apenas retornar null
    return null;
  }
};
