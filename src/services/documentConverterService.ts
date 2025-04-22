
/**
 * Serviço especializado na conversão e extração de texto de documentos
 * Responsável por extrair, limpar, e chunkar o texto antes do envio à API
 */
import { cleanDocumentContent } from './documentContentCleaner';

// Tamanhos padrão para chunks de diferentes formatos
const CHUNK_SIZES = {
  pdf: 6000,
  docx: 8000,
  txt: 10000,
  default: 8000
};

/**
 * Interface para o resultado da extração de texto
 */
export interface ExtractedContent {
  chunks: string[];           // Texto dividido em pedaços menores para processamento
  isComplete: boolean;        // Indica se a extração foi completa ou parcial
  warnings?: string[];        // Avisos sobre o processo de extração
  originalLength: number;     // Tamanho original do conteúdo
  totalChunks: number;        // Número total de chunks
  isBinary: boolean;          // Indica se o conteúdo original era binário/difícil de extrair
}

/**
 * Extrai texto de um arquivo e divide em chunks
 * @param fileContent Conteúdo do arquivo
 * @param fileName Nome do arquivo para determinar o tipo
 * @returns Conteúdo extraído e dividido em chunks
 */
export const extractAndChunkContent = (
  fileContent: string, 
  fileName: string
): ExtractedContent => {
  const warnings: string[] = [];
  const fileExt = fileName.split('.').pop()?.toLowerCase() || 'txt';
  
  // Determina o tamanho do chunk com base no formato do arquivo
  const chunkSize = CHUNK_SIZES[fileExt as keyof typeof CHUNK_SIZES] || CHUNK_SIZES.default;
  
  console.log(`Extraindo texto de ${fileName} (${fileContent.length} caracteres)`);
  
  // Se o conteúdo for vazio ou muito pequeno
  if (!fileContent || fileContent.length < 50) {
    return {
      chunks: [fileContent || ""],
      isComplete: true,
      originalLength: fileContent?.length || 0,
      totalChunks: 1,
      isBinary: false,
      warnings: ["Documento vazio ou com conteúdo mínimo"]
    };
  }
  
  // Limpa e prepara o conteúdo utilizando o serviço existente
  const { cleanContent, isBinary, isUnreadable, warning } = cleanDocumentContent(fileContent);
  
  // Se o conteúdo estiver ilegível, retorna apenas um aviso
  if (isUnreadable) {
    return {
      chunks: ["Conteúdo do documento ilegível ou incompatível."],
      isComplete: false,
      originalLength: fileContent.length,
      totalChunks: 1,
      isBinary: true,
      warnings: [warning || "O arquivo parece estar em formato incompatível com extração de texto."]
    };
  }
  
  // Registra avisos se o conteúdo for binário/problemático
  if (warning) {
    warnings.push(warning);
  }
  
  // Divide o conteúdo em chunks
  const chunks = chunkContent(cleanContent, chunkSize);
  
  console.log(`Texto dividido em ${chunks.length} chunks de ~${chunkSize} caracteres`);
  
  return {
    chunks,
    isComplete: chunks.length > 0,
    originalLength: fileContent.length,
    totalChunks: chunks.length,
    isBinary,
    warnings: warnings.length > 0 ? warnings : undefined
  };
};

/**
 * Divide o texto em chunks menores
 * @param content Texto limpo para dividir
 * @param chunkSize Tamanho aproximado de cada chunk
 * @returns Array de chunks de texto
 */
export const chunkContent = (content: string, chunkSize: number): string[] => {
  if (!content || content.length <= chunkSize) {
    return [content];
  }
  
  const chunks: string[] = [];
  let remainingContent = content;
  
  // Estratégia de chunking inteligente que tenta quebrar em parágrafos ou frases
  while (remainingContent.length > 0) {
    if (remainingContent.length <= chunkSize) {
      chunks.push(remainingContent);
      break;
    }
    
    // Encontra um bom ponto para cortar o texto: prefere parágrafos, depois frases
    let cutIndex = findOptimalCutPoint(remainingContent, chunkSize);
    
    // Adiciona o chunk atual
    chunks.push(remainingContent.substring(0, cutIndex).trim());
    
    // Remove o chunk processado do conteúdo restante
    remainingContent = remainingContent.substring(cutIndex).trim();
  }
  
  return chunks;
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
 * Combina os resultados de análise de múltiplos chunks
 * @param analysisResults Array de resultados de análise de diferentes chunks
 * @returns Análise combinada
 */
export const combineChunkAnalysis = (analysisResults: any[]): any => {
  if (!analysisResults || analysisResults.length === 0) {
    return {};
  }
  
  if (analysisResults.length === 1) {
    return analysisResults[0];
  }
  
  // Combina os resumos com marcação clara de cada parte
  const combinedSummary = analysisResults
    .map((result, index) => result.summary ? 
      `Parte ${index + 1}: ${result.summary}` : '')
    .filter(summary => summary.length > 0)
    .join('\n\n');
  
  // Combina os pontos-chave sem duplicações
  const keyPointTitles = new Set<string>();
  const combinedKeyPoints = analysisResults
    .flatMap(result => result.keyPoints || [])
    .filter(point => {
      // Remove pontos duplicados baseado no título
      if (point && point.title) {
        if (keyPointTitles.has(point.title)) return false;
        keyPointTitles.add(point.title);
        return true;
      }
      return false;
    });
  
  // Combina os destaques escolhendo os mais relevantes de cada chunk
  const combinedHighlights = analysisResults
    .flatMap(result => (result.highlights || []).slice(0, 2))
    .slice(0, 5);
  
  // Combina os conteúdos (opcional, pode ficar muito grande)
  const combinedContent = analysisResults
    .map(result => result.content || '')
    .join('\n\n--- Nova Seção ---\n\n');
  
  return {
    summary: combinedSummary,
    keyPoints: combinedKeyPoints,
    highlights: combinedHighlights,
    content: combinedContent
  };
};
