
import { DocumentAnalysis } from '../documentTypes';

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
