
/**
 * Funções para limpeza e normalização de conteúdo de documentos
 */

/**
 * Limpa o conteúdo de um arquivo de texto
 * @param content Conteúdo do arquivo
 * @returns Conteúdo limpo
 */
export const cleanTextContent = (content: string): string => {
  let cleanedContent = content;
  
  // Normalizar quebras de linha
  cleanedContent = cleanedContent.replace(/\r\n/g, '\n');
  
  // Substituir sequências longas de espaços por um único espaço
  cleanedContent = cleanedContent.replace(/\s{2,}/g, ' ');
  
  // Remover espaços no início e fim do texto
  cleanedContent = cleanedContent.trim();
  
  return cleanedContent;
};

/**
 * Limpa o conteúdo de um arquivo PDF
 * @param content Conteúdo do arquivo PDF
 * @returns Conteúdo limpo
 */
export const cleanPdfContent = (content: string): string => {
  let cleanedContent = content;
  
  // Remover caracteres nulos que podem prejudicar o processamento
  cleanedContent = cleanedContent.replace(/\0/g, ' ');
  
  // Normalizar quebras de linha
  cleanedContent = cleanedContent.replace(/\r\n/g, '\n');
  
  // Remover caracteres de controle e bytes estranhos que podem vir em PDFs
  cleanedContent = cleanedContent.replace(/[\x01-\x09\x0B-\x0C\x0E-\x1F\x7F-\x9F]/g, ' ');
  
  // Substituir sequências longas de espaços por um único espaço
  cleanedContent = cleanedContent.replace(/\s{2,}/g, ' ');
  
  // Remover espaços no início e fim do texto
  cleanedContent = cleanedContent.trim();
  
  return cleanedContent;
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
