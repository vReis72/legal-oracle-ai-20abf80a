
import { analyzeWithOpenAI } from '@/services/openai/documentAnalysis';

/**
 * Processa um documento pequeno de uma vez
 */
export const processSmallDocument = async (
  content: string,
  apiKey: string,
  setProgress: (value: number) => void,
  fileData?: string
): Promise<string> => {
  console.log("Enviando documento completo para análise");
  console.log(`Texto para análise: ${content.substring(0, 200)}...`);
  setProgress(40);
  
  const analysisResult = await analyzeWithOpenAI(content, apiKey, fileData);
  
  console.log(`Análise completa tem ${analysisResult.length} caracteres`);
  setProgress(75);
  return analysisResult;
};
