
import { DocumentAnalysis, DocumentType } from '../documentTypes';
import { analyzeDocumentWithAI } from '../documentAnalysisApi';
import { createDocumentAnalysisPrompt } from '../documentPrompts';

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
