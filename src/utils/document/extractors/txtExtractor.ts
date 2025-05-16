
import { TextExtractionOptions, TextExtractionResult } from '../types';
import { createLogger } from '../logger';

/**
 * Extracts text from a plain text file
 * @param file Text file
 * @param options Text extraction options
 * @returns Text extraction result
 */
export const extractTextFromTxt = async (
  file: File, 
  options: TextExtractionOptions = {}
): Promise<TextExtractionResult> => {
  const logger = createLogger(options);
  
  logger.info(`Extraindo texto do arquivo TXT: ${file.name}`);
  
  try {
    const text = await file.text();
    logger.info(`Texto extraído do arquivo TXT, tamanho: ${text.length} caracteres`);
    
    if (options.verbose) {
      logger.info(`Amostra: "${text.substring(0, 100)}..."`);
    }
    
    return {
      success: true,
      text,
      source: {
        name: file.name,
        type: file.type,
        size: file.size
      }
    };
  } catch (error) {
    logger.error("Erro ao ler arquivo de texto", error);
    
    return {
      success: false,
      error: "Falha ao ler o arquivo de texto",
      source: {
        name: file.name,
        type: file.type,
        size: file.size
      }
    };
  }
};
