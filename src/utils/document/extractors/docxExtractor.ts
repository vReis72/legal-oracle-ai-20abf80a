
import { TextExtractionOptions, TextExtractionResult } from '../types';
import { createLogger } from '../logger';
import { showNotification } from '../notifications';

/**
 * Placeholder for DOCX text extraction (not implemented)
 * @param file DOCX file
 * @param options Text extraction options
 * @returns Text extraction result with error
 */
export const extractTextFromDocx = async (
  file: File, 
  options: TextExtractionOptions = {}
): Promise<TextExtractionResult> => {
  const logger = createLogger(options);
  
  logger.info(`Tentativa de extração de texto de DOCX: ${file.name}`);
  showNotification(options, 'warning', "Extração de texto de arquivos DOCX ainda não implementada");
  
  return {
    success: false,
    error: "Extração de texto de DOCX não implementada",
    source: {
      name: file.name,
      type: file.type,
      size: file.size
    }
  };
};
