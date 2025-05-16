
/**
 * Main module for text extraction from various document types
 */
import { TextExtractionOptions } from './types';
import { extractTextFromPDF } from './extractors/pdfExtractor';
import { extractTextFromTxt } from './extractors/txtExtractor';
import { extractTextFromDocx } from './extractors/docxExtractor';
import { isSupportedFileType } from './validation';
import { createLogger } from './logger';
import { showNotification } from './notifications';

/**
 * Extracts text from different file types
 * @param file File to extract text from (PDF, DOCX, TXT)
 * @param options Text extraction options
 * @returns Promise with extracted text or error
 */
export const extractTextFromFile = async (
  file: File, 
  options: TextExtractionOptions = { verbose: false, showToasts: true }
): Promise<string> => {
  const logger = createLogger(options);
  
  logger.info(`Iniciando extração de texto do arquivo: ${file.name} (${file.type})`);
  
  if (!isSupportedFileType(file)) {
    const errorMessage = `Formato de arquivo não suportado: ${file.type}`;
    logger.error(errorMessage);
    showNotification(options, 'error', errorMessage);
    throw new Error(errorMessage);
  }
  
  let result;
  
  // Process file based on type
  if (file.type === 'text/plain') {
    result = await extractTextFromTxt(file, options);
  } else if (file.type === 'application/pdf') {
    result = await extractTextFromPDF(file, options);
  } else {
    // DOCX or other supported document formats
    result = await extractTextFromDocx(file, options);
  }
  
  // Handle extraction result
  if (result.success && result.text) {
    logger.info(`Extração de texto concluída com sucesso para: ${file.name}`);
    return result.text;
  } else {
    logger.error(`Falha na extração de texto: ${result.error}`);
    showNotification(options, 'error', result.error || "Erro desconhecido na extração de texto");
    throw new Error(result.error || "Falha na extração de texto");
  }
};

// Re-export types for convenience
export { TextExtractionOptions, TextExtractionResult } from './types';
