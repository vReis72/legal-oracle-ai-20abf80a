
import { toast } from "sonner";

export type ProcessorState = {
  setIsAnalyzing: (value: boolean) => void;
  setProgress: (value: number) => void;
  setAnalysisError: (value: string | null) => void;
  retryAttempts: number;
  setRetryAttempts: (value: number) => void;
  MAX_RETRIES: number;
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
    // Auto-retry for connection issues
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
