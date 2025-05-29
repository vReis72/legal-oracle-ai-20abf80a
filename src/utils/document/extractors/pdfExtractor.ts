
import * as pdfjsLib from 'pdfjs-dist';
import { toast } from "sonner";
import { isPdfWorkerConfigured, configurePdfWorker } from '../../pdf/pdfWorkerConfig';
import { createLogger } from '../logger';
import { TextExtractionOptions, TextExtractionResult } from '../types';

/**
 * Extrai texto de um arquivo PDF de forma simplificada e confiável
 */
export const extractTextFromPDF = async (
  file: File, 
  options: TextExtractionOptions = {}
): Promise<TextExtractionResult> => {
  const { timeout = 60000 } = options; // Aumentado para 60 segundos
  const logger = createLogger(options);
  
  logger.info(`Iniciando extração de texto do PDF: ${file.name}`);
  
  try {
    // Garantir que o worker esteja configurado
    if (!isPdfWorkerConfigured()) {
      logger.info("Configurando worker do PDF.js...");
      const workerResult = configurePdfWorker({
        verbose: options.verbose,
        showToasts: options.showToasts
      });
      
      if (!workerResult.success) {
        throw new Error(`Falha ao configurar worker: ${workerResult.error}`);
      }
    }
    
    // Carregar arquivo como ArrayBuffer
    logger.info("Carregando arquivo...");
    const arrayBuffer = await file.arrayBuffer();
    
    if (!arrayBuffer || arrayBuffer.byteLength === 0) {
      throw new Error("Arquivo PDF vazio ou corrompido");
    }
    
    logger.info(`ArrayBuffer carregado: ${arrayBuffer.byteLength} bytes`);
    
    // Carregar PDF com configuração simplificada
    logger.info("Carregando documento PDF...");
    const loadingTask = pdfjsLib.getDocument({ 
      data: arrayBuffer,
      disableAutoFetch: true,
      disableStream: true
    });
    
    // Aguardar carregamento com timeout
    const pdfDoc = await Promise.race([
      loadingTask.promise,
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error("Timeout ao carregar PDF")), timeout)
      )
    ]);
    
    logger.info(`PDF carregado com sucesso. Páginas: ${pdfDoc.numPages}`);
    
    if (pdfDoc.numPages <= 0) {
      throw new Error("PDF não contém páginas");
    }
    
    // Extrair texto de todas as páginas
    let fullText = '';
    for (let i = 1; i <= pdfDoc.numPages; i++) {
      logger.info(`Processando página ${i}/${pdfDoc.numPages}...`);
      
      const page = await pdfDoc.getPage(i);
      const textContent = await page.getTextContent();
      
      if (textContent?.items?.length) {
        const pageText = textContent.items
          .map((item: any) => item.str || "")
          .filter(str => str.trim().length > 0)
          .join(' ');
          
        if (pageText.trim().length > 0) {
          fullText += pageText + '\n\n';
          logger.info(`Página ${i}: ${pageText.length} caracteres extraídos`);
        }
      }
    }
    
    // Validar texto extraído
    const trimmedText = fullText.trim();
    if (trimmedText.length === 0) {
      throw new Error("Não foi possível extrair texto do PDF. O arquivo pode estar protegido ou ser uma imagem digitalizada.");
    }
    
    logger.info(`Extração concluída: ${trimmedText.length} caracteres`);
    
    return {
      success: true,
      text: trimmedText,
      source: {
        name: file.name,
        type: file.type,
        size: file.size
      }
    };
  } catch (error) {
    logger.error("Erro na extração de PDF", error);
    
    let errorMessage = "Erro desconhecido";
    if (error instanceof Error) {
      errorMessage = error.message;
      
      // Mensagens mais específicas para erros comuns
      if (errorMessage.includes("Timeout")) {
        errorMessage = "O PDF é muito grande ou complexo. Tente um arquivo menor.";
      } else if (errorMessage.includes("password")) {
        errorMessage = "PDF protegido por senha não é suportado.";
      } else if (errorMessage.includes("worker") || errorMessage.includes("fetch")) {
        errorMessage = "Erro ao carregar processador de PDF. Verifique sua conexão.";
      }
    }
    
    return {
      success: false,
      error: `Falha ao extrair texto do PDF: ${errorMessage}`,
      source: {
        name: file.name,
        type: file.type,
        size: file.size
      }
    };
  }
};
