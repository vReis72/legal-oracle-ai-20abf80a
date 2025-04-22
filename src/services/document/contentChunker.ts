
/**
 * Serviço especializado em dividir conteúdo em chunks para processamento
 */

/**
 * Interface para configurações do chunker
 */
export interface ChunkerConfig {
  maxChunkSize: number;
  overlapSize?: number;
  preserveWordBoundaries?: boolean;
}

/**
 * Tamanhos padrão para chunks de diferentes formatos
 */
export const DEFAULT_CHUNK_SIZES: Record<string, number> = {
  pdf: 6000,
  docx: 8000,
  txt: 10000,
  doc: 8000,
  default: 3500
};

/**
 * Encontra um ponto ótimo para cortar o texto
 * @param text Texto a ser cortado
 * @param targetLength Comprimento alvo para o corte
 * @returns Índice onde cortar o texto
 */
const findOptimalCutPoint = (text: string, targetLength: number): number => {
  if (text.length <= targetLength) {
    return text.length;
  }
  
  // Tenta cortar em um parágrafo
  const paragraphBreak = text.lastIndexOf('\n\n', targetLength);
  if (paragraphBreak > targetLength * 0.8) {
    return paragraphBreak + 2; // +2 para incluir as quebras de linha
  }
  
  // Tenta cortar em uma linha
  const lineBreak = text.lastIndexOf('\n', targetLength);
  if (lineBreak > targetLength * 0.8) {
    return lineBreak + 1; // +1 para incluir a quebra de linha
  }
  
  // Tenta cortar em um ponto final seguido de espaço
  const sentenceBreak = text.lastIndexOf('. ', targetLength);
  if (sentenceBreak > targetLength * 0.7) {
    return sentenceBreak + 2; // +2 para incluir o ponto e espaço
  }
  
  // Tenta cortar em uma vírgula
  const commaBreak = text.lastIndexOf(', ', targetLength);
  if (commaBreak > targetLength * 0.8) {
    return commaBreak + 2; // +2 para incluir a vírgula e espaço
  }
  
  // Se não encontrou um bom ponto, corta em um espaço
  const spaceBreak = text.lastIndexOf(' ', targetLength);
  if (spaceBreak > 0) {
    return spaceBreak + 1; // +1 para incluir o espaço
  }
  
  // Em último caso, corta exatamente no tamanho alvo
  return targetLength;
};

/**
 * Divide o texto em chunks menores com base no exemplo fornecido pelo usuário
 * @param content Texto para dividir
 * @param config Configurações para o chunking
 * @returns Array de chunks de texto
 */
export const chunkContent = (
  content: string, 
  config: ChunkerConfig = { maxChunkSize: DEFAULT_CHUNK_SIZES.default }
): string[] => {
  if (!content || content.length <= config.maxChunkSize) {
    return [content];
  }
  
  const chunks: string[] = [];
  let remainingContent = content;
  
  while (remainingContent.length > 0) {
    if (remainingContent.length <= config.maxChunkSize) {
      chunks.push(remainingContent);
      break;
    }
    
    // Usando o algoritmo do exemplo fornecido pelo usuário, adaptado para nossa arquitetura
    let cutIndex = config.preserveWordBoundaries !== false
      ? findOptimalCutPoint(remainingContent, config.maxChunkSize)
      : config.maxChunkSize;
    
    // Adiciona o chunk atual
    chunks.push(remainingContent.substring(0, cutIndex).trim());
    
    // Remove o chunk processado do conteúdo restante
    remainingContent = remainingContent.substring(cutIndex).trim();
  }
  
  return chunks;
};
