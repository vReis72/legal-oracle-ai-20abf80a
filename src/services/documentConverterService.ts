
/**
 * Serviço de conversão entre diferentes formatos de documento
 */

/**
 * Converte conteúdo de texto para formato simplificado
 * @param content Conteúdo original
 * @returns Conteúdo convertido para formato simplificado
 */
export const convertToPlainText = (content: string): string => {
  // Remove caracteres especiais e formatações
  let plainText = content;
  
  // Remove marcações HTML simples
  plainText = plainText.replace(/<[^>]*>/g, ' ');
  
  // Remove caracteres Unicode especiais
  plainText = plainText.replace(/[\u2018\u2019]/g, "'"); // aspas simples
  plainText = plainText.replace(/[\u201C\u201D]/g, '"'); // aspas duplas
  plainText = plainText.replace(/[\u2013\u2014]/g, '-'); // travessões
  
  // Normaliza espaços
  plainText = plainText.replace(/\s+/g, ' ').trim();
  
  return plainText;
};

/**
 * Converte conteúdo para formato de análise
 * @param content Conteúdo original
 * @param fileFormat Formato do arquivo original
 * @returns Conteúdo convertido para análise
 */
export const convertToAnalysisFormat = (content: string, fileFormat: string): string => {
  // Realiza conversão específica para cada formato
  if (fileFormat === 'pdf') {
    // Para PDFs, pode ser necessário tratamento especial
    return convertToPlainText(content);
  }
  
  if (fileFormat === 'docx' || fileFormat === 'doc') {
    // Para documentos Word, remove cabeçalhos/rodapés se possível
    return convertToPlainText(content);
  }
  
  // Para formato texto, mantém o texto original com mínimo de limpeza
  return content.trim();
};
