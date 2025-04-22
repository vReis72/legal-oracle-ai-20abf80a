
/**
 * Funções de validação para conteúdo de documentos
 */

/**
 * Verifica se o conteúdo do documento é válido para processamento
 * @param content Conteúdo do documento
 * @returns Verdadeiro se o conteúdo for válido
 */
export const isValidContent = (content: string): boolean => {
  if (!content || content.trim().length === 0) {
    return false;
  }
  
  // Verificar conteúdo mínimo para processamento (pelo menos 20 caracteres)
  if (content.trim().length < 20) {
    return false;
  }
  
  return true;
};

/**
 * Verifica se o documento PDF tem conteúdo extraível
 * @param content Conteúdo do documento
 * @returns Objeto indicando se é válido e possíveis avisos
 */
export const validatePdfContent = (content: string): { isValid: boolean; warnings: string[] } => {
  const warnings: string[] = [];
  
  if (!isValidContent(content)) {
    return { isValid: false, warnings: ['Conteúdo do PDF insuficiente para processamento.'] };
  }
  
  // Verificar se parece ser um PDF escaneado sem OCR
  if (content.length < 100 && content.trim().split(/\s+/).length < 20) {
    warnings.push('O PDF pode ser um documento escaneado sem OCR. A extração de texto pode ser limitada.');
  }
  
  // Verificar se há marcadores de forma que sugerem problemas na extração
  if (content.includes('�') || content.includes('�')) {
    warnings.push('O PDF contém caracteres não reconhecidos. A qualidade da análise pode ser afetada.');
  }
  
  return { isValid: true, warnings };
};
