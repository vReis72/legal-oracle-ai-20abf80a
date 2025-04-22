
import { cleanFileContent } from './fileContentCleaner';
import { chunkContent, DEFAULT_CHUNK_SIZES } from './contentChunker';

/**
 * Interface para resultado da extração e chunking
 */
export interface ProcessingResult {
  chunks: string[];
  warnings?: string[];
  isComplete: boolean;
}

/**
 * Processa e divide o conteúdo do arquivo em chunks
 * @param fileContent Conteúdo do arquivo
 * @param fileName Nome do arquivo
 * @param fileFormat Formato do arquivo
 * @returns Resultado do processamento
 */
export const processAndChunkContent = (
  fileContent: string,
  fileName: string,
  fileFormat: string
): ProcessingResult => {
  const warnings: string[] = [];
  
  // Verificações iniciais
  if (!fileContent || fileContent.trim().length < 20) {
    return {
      chunks: ['Conteúdo do documento insuficiente para análise.'],
      warnings: ['O documento está vazio ou contém muito pouco texto.'],
      isComplete: false
    };
  }

  // Limpa o conteúdo baseado no formato
  const cleanedContent = cleanFileContent(fileContent, fileFormat);
  
  // Se o conteúdo ficou muito pequeno após limpeza
  if (cleanedContent.length < 100 && fileFormat === 'pdf') {
    warnings.push('O PDF pode conter imagens ou texto não extraível. A análise será limitada.');
  }

  // Determina o tamanho dos chunks baseado no formato
  const chunkSize = DEFAULT_CHUNK_SIZES[fileFormat] || DEFAULT_CHUNK_SIZES.default;
  
  // Divide o conteúdo em chunks
  const chunks = chunkContent(cleanedContent, { maxChunkSize: chunkSize });
  
  return {
    chunks,
    warnings: warnings.length > 0 ? warnings : undefined,
    isComplete: chunks.length > 0
  };
};
