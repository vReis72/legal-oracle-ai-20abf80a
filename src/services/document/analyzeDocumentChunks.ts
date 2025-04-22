
import { DocumentAnalysis, DocumentType } from '../documentTypes';
import { analyzeDocumentWithAI } from '../documentAnalysisApi';
import { createDocumentAnalysisPrompt } from '../documentPrompts';
import type { GptModel } from '@/hooks/use-documents';

export const analyzeDocumentChunks = async (
  chunks: string[],
  fileName: string,
  documentType: DocumentType,
  gptModel: GptModel = 'gpt-4-turbo'
): Promise<DocumentAnalysis[]> => {
  const isPdf = fileName.toLowerCase().endsWith('.pdf');

  const analysisPromises = chunks.map(async (chunk, index) => {
    try {
      const prompt = createDocumentAnalysisPrompt(
        chunk, 
        `${fileName} (parte ${index + 1}/${chunks.length})`, 
        documentType
      );
      
      // Pass the gptModel parameter to analyzeDocumentWithAI
      return await analyzeDocumentWithAI(prompt, isPdf, gptModel);
    } catch (error) {
      console.error(`Erro na análise do chunk ${index + 1}:`, error);

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
