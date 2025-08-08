
import { Document } from '@/types/document';
import { v4 as uuidv4 } from 'uuid';
import { parseAnalysisResult } from '@/utils/textProcessing';
import { toast } from "sonner";

/**
 * Cria um documento analisado a partir dos resultados
 */
export const createAnalyzedDocument = (
  document: Document, 
  analysisResult: string
): Document => {
  const { summary, keyPoints, conclusion } = parseAnalysisResult(analysisResult);
  
  // Log the parsed results for debugging
  console.log("Resumo extraído:", summary);
  console.log("Pontos-chave extraídos:", JSON.stringify(keyPoints, null, 2));
  console.log("Conclusão extraída:", conclusion);
  
  if (!summary) {
    console.warn("Processamento não gerou resumo adequado");
    toast.warning("O resumo gerado pode não ser ideal. Verifique os resultados.");
  }
  
  return {
    ...document,
    id: document.id || uuidv4(),
    processed: true,
    summary: summary || "Não foi possível gerar um resumo para este documento. O conteúdo pode não ser adequado para análise.",
    keyPoints: keyPoints.length > 0 ? keyPoints : [{
      title: "Análise Insuficiente",
      description: "Não foi possível extrair pontos-chave deste documento. O conteúdo pode não conter pontos definidos ou pode ser inadequado para análise."
    }],
    conclusion: conclusion || "Não é possível extrair uma conclusão definitiva do documento fornecido.",
    content: document.content, // Garantir que o conteúdo original seja preservado
  };
};
