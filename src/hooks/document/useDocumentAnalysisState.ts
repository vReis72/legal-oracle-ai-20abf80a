
import { useState } from 'react';

/**
 * Hook que gerencia o estado da análise de documentos
 */
export const useDocumentAnalysisState = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [retryAttempts, setRetryAttempts] = useState(0);
  
  // Constantes
  const MAX_RETRIES = 2;

  return {
    isAnalyzing,
    setIsAnalyzing,
    progress,
    setProgress,
    analysisError,
    setAnalysisError,
    retryAttempts,
    setRetryAttempts,
    MAX_RETRIES
  };
};
