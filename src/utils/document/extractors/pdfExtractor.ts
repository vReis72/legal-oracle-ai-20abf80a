
import * as pdfjsLib from 'pdfjs-dist';
import { toast } from "sonner";
import { isPdfWorkerConfigured, configurePdfWorker } from '../../pdf/pdfWorkerConfig';
import { createLogger } from '../logger';
import { TextExtractionOptions, TextExtractionResult } from '../types';

/**
 * Extracts text from a PDF file
 * @param file PDF file
 * @param options Text extraction options
 * @returns Text extraction result
 */
export const extractTextFromPDF = async (
  file: File, 
  options: TextExtractionOptions = {}
): Promise<TextExtractionResult> => {
  const { timeout = 30000 } = options;
  const logger = createLogger(options);
  
  logger.info(`Iniciando extração de texto do PDF: ${file.name}`);
  
  try {
    // Ensure PDF worker is configured
    if (!isPdfWorkerConfigured()) {
      logger.info("Worker não configurado, tentando configurar novamente...");
      const workerResult = configurePdfWorker({
        verbose: options.verbose,
        showToasts: options.showToasts
      });
      
      if (!workerResult.success) {
        throw new Error(`Não foi possível configurar o worker do PDF.js: ${workerResult.error}`);
      }
    }
    
    // Load file as ArrayBuffer
    logger.info("Carregando arquivo como ArrayBuffer...");
    const arrayBuffer = await file.arrayBuffer();
    logger.info(`ArrayBuffer carregado, tamanho: ${arrayBuffer.byteLength} bytes`);
    
    // Validate ArrayBuffer
    if (!arrayBuffer || arrayBuffer.byteLength === 0) {
      throw new Error("ArrayBuffer vazio ou inválido");
    }
    
    // Create PDF loading task with error handling
    logger.info("Criando tarefa de carregamento do PDF...");
    let loadingTask;
    try {
      loadingTask = pdfjsLib.getDocument({ 
        data: arrayBuffer,
        cMapUrl: 'https://unpkg.com/pdfjs-dist@latest/cmaps/',
        cMapPacked: true
      });
      logger.info("Tarefa de carregamento do PDF criada com sucesso");
    } catch (pdfError) {
      logger.error("Erro ao criar tarefa de carregamento do PDF", pdfError);
      throw new Error("Falha ao iniciar o carregamento do PDF");
    }
    
    // Wait for PDF to load with timeout
    logger.info("Aguardando carregamento do PDF...");
    const pdfDoc = await Promise.race([
      loadingTask.promise,
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error("Timeout ao carregar PDF")), timeout)
      )
    ]);
    
    logger.info(`PDF carregado com sucesso. Número de páginas: ${pdfDoc.numPages}`);
    
    // Check if PDF has pages
    if (pdfDoc.numPages <= 0) {
      throw new Error("O PDF não contém páginas");
    }
    
    // Extract text from all pages
    let fullText = '';
    for (let i = 1; i <= pdfDoc.numPages; i++) {
      logger.info(`Extraindo texto da página ${i}/${pdfDoc.numPages}...`);
      const page = await pdfDoc.getPage(i);
      const textContent = await page.getTextContent();
      
      // Validate text content
      if (!textContent || !textContent.items || !textContent.items.length) {
        logger.warn(`Página ${i}: Nenhum conteúdo de texto encontrado`);
        continue;
      }
      
      // Join text items with proper spacing
      const pageText = textContent.items
        .map((item: any) => item.str || "")
        .join(' ');
        
      fullText += pageText + '\n\n';
      
      // Log sample of extracted text
      if (pageText.length > 0 && options.verbose) {
        logger.info(`Página ${i}: extraídos ${pageText.length} caracteres`);
        logger.info(`Amostra: "${pageText.substring(0, 50)}..."`);
      } else if (pageText.length === 0) {
        logger.warn(`Página ${i}: texto extraído está vazio`);
      }
    }
    
    // Validate extracted text
    if (!fullText || fullText.trim().length === 0) {
      throw new Error("Não foi possível extrair texto do PDF. O arquivo pode estar protegido ou ser uma imagem digitalizada.");
    }
    
    logger.info(`Extração concluída. Total: ${fullText.length} caracteres`);
    
    return {
      success: true,
      text: fullText,
      source: {
        name: file.name,
        type: file.type,
        size: file.size
      }
    };
  } catch (error) {
    logger.error("Erro na extração de texto do PDF", error);
    
    // Create error message based on error type
    let errorMessage = "Erro desconhecido";
    if (error instanceof Error) {
      errorMessage = error.message;
      
      // Add specific messages for common errors
      if (errorMessage.includes("Timeout")) {
        errorMessage = "O processamento do PDF demorou muito tempo. O arquivo pode ser muito grande ou complexo.";
      } else if (errorMessage.includes("password")) {
        errorMessage = "Este PDF está protegido por senha e não pode ser processado.";
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
