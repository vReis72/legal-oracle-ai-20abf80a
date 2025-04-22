
import { DocumentAnalysis, DocumentType } from '../documentTypes';
import { cleanFileContent } from './fileContentCleaner';
import { chunkContent, DEFAULT_CHUNK_SIZES } from './contentChunker';
import { analyzeDocumentWithAI } from '../documentAnalysisApi';
import { createDocumentAnalysisPrompt } from '../documentPrompts';

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

/**
 * Analisa chunks de documento usando a API
 * @param chunks Chunks de texto para análise
 * @param fileName Nome do arquivo
 * @param documentType Tipo de documento
 * @returns Análises por chunk
 */
export const analyzeDocumentChunks = async (
  chunks: string[],
  fileName: string,
  documentType: DocumentType
): Promise<DocumentAnalysis[]> => {
  const isPdf = fileName.toLowerCase().endsWith('.pdf');
  
  // Para cada chunk, cria um prompt e envia para análise
  const analysisPromises = chunks.map(async (chunk, index) => {
    try {
      const prompt = createDocumentAnalysisPrompt(
        chunk, 
        `${fileName} (parte ${index + 1}/${chunks.length})`, 
        documentType
      );
      
      return await analyzeDocumentWithAI(prompt, isPdf);
    } catch (error) {
      console.error(`Erro na análise do chunk ${index + 1}:`, error);
      
      // Retorna um objeto parcial de erro para este chunk
      return {
        summary: `[Erro na análise da parte ${index + 1}/${chunks.length}]`,
        keyPoints: [{
          title: `Erro na parte ${index + 1}`,
          description: "Esta seção do documento não pôde ser analisada."
        }],
        highlights: [],
        content: chunk.substring(0, 500)
      };
    }
  });

  return Promise.all(analysisPromises);
};

/**
 * Combina os resultados de análise de múltiplos chunks
 * @param analysisResults Array de resultados de análise de diferentes chunks
 * @returns Análise combinada
 */
export const combineChunkAnalysis = (analysisResults: DocumentAnalysis[]): DocumentAnalysis => {
  if (!analysisResults || analysisResults.length === 0) {
    return {
      summary: "Não foi possível analisar o documento.",
      keyPoints: [],
      highlights: [],
      content: ""
    };
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
    .filter(content => content.length > 0)
    .join('\n\n--- Nova Seção ---\n\n');
  
  return {
    summary: combinedSummary,
    keyPoints: combinedKeyPoints,
    highlights: combinedHighlights,
    content: combinedContent
  };
};
