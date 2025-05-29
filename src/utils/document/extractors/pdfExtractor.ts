
import * as pdfjsLib from 'pdfjs-dist';
import { configurePdfWorker } from '../../pdf/pdfWorkerConfig';
import { createLogger } from '../logger';
import { TextExtractionOptions, TextExtractionResult } from '../types';

/**
 * Extrai texto de um arquivo PDF sem worker externo
 */
export const extractTextFromPDF = async (
  file: File, 
  options: TextExtractionOptions = {}
): Promise<TextExtractionResult> => {
  const { timeout = 45000 } = options;
  const logger = createLogger(options);
  
  logger.info(`Iniciando extração de texto do PDF: ${file.name}`);
  
  try {
    // Configurar para processamento interno
    logger.info("Configurando PDF para processamento interno...");
    const workerResult = configurePdfWorker({
      verbose: options.verbose,
      showToasts: false
    });
    
    if (!workerResult.success) {
      logger.warn(`Worker configuration failed: ${workerResult.error}, mas continuando...`);
    } else {
      logger.info(`Configuração: ${workerResult.workerSrc}`);
    }
    
    // Carregar arquivo
    logger.info("Carregando arquivo...");
    const arrayBuffer = await file.arrayBuffer();
    
    if (!arrayBuffer || arrayBuffer.byteLength === 0) {
      throw new Error("Arquivo PDF vazio ou corrompido");
    }
    
    logger.info(`ArrayBuffer carregado: ${arrayBuffer.byteLength} bytes`);
    
    // Configuração sem worker externo
    const loadingTask = pdfjsLib.getDocument({
      data: arrayBuffer,
      verbosity: 0,
      disableAutoFetch: true,
      disableStream: true,
      useWorkerFetch: false,
      isEvalSupported: false,
      disableFontFace: true,
      useSystemFonts: true
    });
    
    logger.info("Carregando documento PDF...");
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
      
      try {
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
      } catch (pageError) {
        logger.warn(`Erro na página ${i}, continuando...`);
        continue;
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
