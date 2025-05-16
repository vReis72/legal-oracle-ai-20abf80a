
import { Document } from '@/types/document';
import { toast } from "sonner";
import { v4 as uuidv4 } from 'uuid';
import { analyzeWithOpenAI } from '@/services/openai/documentAnalysis';
import { splitTextIntoChunks, parseAnalysisResult } from '@/utils/textProcessing';

type ProcessorState = {
  setIsAnalyzing: (value: boolean) => void;
  setProgress: (value: number) => void;
  setAnalysisError: (value: string | null) => void;
  retryAttempts: number;
  setRetryAttempts: (value: number) => void;
  MAX_RETRIES: number;
};

/**
 * Valida o documento e a chave API antes do processamento
 */
export const validateDocumentAndApiKey = (
  document: Document,
  apiKey: string,
  setAnalysisError: (value: string | null) => void
): boolean => {
  if (!document || !document.id) {
    toast.error("Documento inválido");
    return false;
  }
  
  if (!document.content) {
    toast.error("Documento sem conteúdo para análise");
    setAnalysisError("Documento não contém texto para análise. Verifique o arquivo.");
    return false;
  }

  if (document.content.trim().length < 50) {
    toast.error("Texto do documento é muito curto para uma análise significativa");
    setAnalysisError("Conteúdo do documento insuficiente para análise (menos de 50 caracteres).");
    return false;
  }

  if (!apiKey) {
    setAnalysisError("Chave da API OpenAI não configurada. Configure nas configurações.");
    toast.error("Chave da API OpenAI não configurada");
    return false;
  }

  return true;
};

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

/**
 * Processa um documento pequeno de uma vez
 */
export const processSmallDocument = async (
  content: string,
  apiKey: string,
  setProgress: (value: number) => void
): Promise<string> => {
  console.log("Enviando documento completo para análise");
  console.log(`Texto para análise: ${content.substring(0, 200)}...`);
  setProgress(40);
  const analysisResult = await analyzeWithOpenAI(content, apiKey);
  console.log(`Análise completa tem ${analysisResult.length} caracteres`);
  setProgress(75);
  return analysisResult;
};

/**
 * Gerencia erros durante o processamento do documento
 */
export const handleProcessingError = (
  error: unknown,
  state: ProcessorState,
  processDocument: () => Promise<void>
): void => {
  console.error("Erro na análise do documento:", error);
  
  const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
  state.setAnalysisError(errorMessage);
  
  // Handle specific error types
  if (errorMessage.includes("API key")) {
    toast.error("Erro de autenticação na API OpenAI. Verifique sua chave API.");
  } else if (errorMessage.includes("limite") || errorMessage.includes("429")) {
    toast.error("Limite de requisições excedido. Tente novamente mais tarde.");
  } else if (state.retryAttempts < state.MAX_RETRIES && 
            (errorMessage.includes("conexão") || 
              errorMessage.includes("Network") || 
              errorMessage.includes("500"))) {
    // Auto-retry for connection issues - FIX for type error: use a numeric value instead of a function
    state.setRetryAttempts(state.retryAttempts + 1);
    toast.warning(`Erro de conexão. Tentando novamente (${state.retryAttempts + 1}/${state.MAX_RETRIES})...`);
    
    // Wait a moment before retrying
    setTimeout(() => {
      processDocument();
    }, 3000);
  } else {
    toast.error(`Erro ao analisar o documento: ${errorMessage}. Por favor, tente novamente.`);
  }

  state.setIsAnalyzing(false);
};

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
