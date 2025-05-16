
import { analyzeWithOpenAI } from '@/services/openai/documentAnalysis';
import { splitTextIntoChunks } from '@/utils/textProcessing';
import { toast } from "sonner";

/**
 * Processa um documento grande em pedaços
 */
export const processLargeDocument = async (
  content: string,
  apiKey: string,
  setProgress: (value: number) => void
): Promise<string> => {
  const chunks = splitTextIntoChunks(content);
  console.log(`Documento dividido em ${chunks.length} partes para processamento`);
  setProgress(20);
  
  if (chunks.length === 0) {
    throw new Error("Erro ao dividir o documento em partes menores");
  }
  
  // Process each chunk
  const chunkResults: string[] = [];
  for (let i = 0; i < chunks.length; i++) {
    try {
      console.log(`Processando parte ${i+1} de ${chunks.length} (${chunks[i].length} caracteres)`);
      console.log(`Primeiros 100 caracteres do chunk ${i+1}: "${chunks[i].substring(0, 100)}..."`);
      const chunkResult = await analyzeWithOpenAI(chunks[i], apiKey);
      chunkResults.push(chunkResult);
      setProgress(30 + ((i + 1) / chunks.length * 40));
    } catch (error) {
      console.error(`Erro ao processar parte ${i+1}:`, error);
      
      // If we've already got some results, continue with what we have
      if (chunkResults.length > 0) {
        toast.warning(`Erro ao processar parte ${i+1} do documento. Continuando com partes já analisadas.`);
        break;
      } else {
        // If this is the first chunk and it failed, we need to throw
        throw error;
      }
    }
  }
  
  // Combine results
  let analysisResult = chunkResults.join("\n\n");
  console.log("Análises de partes combinadas com sucesso");
  console.log(`Resultado combinado tem ${analysisResult.length} caracteres`);
  
  // Final analysis of combined results if needed
  if (chunkResults.length > 1) {
    try {
      console.log("Realizando análise final dos resultados combinados");
      setProgress(75);
      analysisResult = await analyzeWithOpenAI(
        "Este é um resumo de múltiplas partes de um documento. Por favor forneça uma análise consolidada:\n\n" +
        analysisResult.substring(0, 7500), 
        apiKey
      );
      console.log(`Análise final tem ${analysisResult.length} caracteres`);
    } catch (error) {
      console.error("Erro na análise final:", error);
      // Continue with the concatenated results if final analysis fails
      toast.warning("Erro na análise final. Usando resultados parciais combinados.");
    }
  }
  
  return analysisResult;
};
