
/**
 * Utilitários para limpeza e preparação de conteúdo de documentos
 */

import { cleanPdfContent as cleanPdf, cleanTextContent as cleanText } from '../documentContentCleaner';

/**
 * Limpa o conteúdo de um arquivo PDF
 * @param content Conteúdo original do arquivo
 * @returns Conteúdo limpo
 */
export const cleanPdfContent = (content: string): string => {
  return cleanPdf(content);
};

/**
 * Limpa o conteúdo de qualquer arquivo de texto
 * @param content Conteúdo original do arquivo
 * @returns Conteúdo limpo
 */
export const cleanTextContent = (content: string): string => {
  return cleanText(content);
};

/**
 * Seleciona o método de limpeza adequado com base no tipo de arquivo
 * @param content Conteúdo do arquivo
 * @param fileFormat Formato do arquivo
 * @returns Conteúdo limpo
 */
export const cleanFileContent = (content: string, fileFormat: string): string => {
  if (fileFormat === 'pdf') {
    return cleanPdfContent(content);
  }
  
  return cleanTextContent(content);
};
