
import { useState, useEffect } from 'react';

/**
 * Hook para controlar timeout de processamento de documentos
 */
export const useProcessingTimeout = () => {
  const [processingTimeout, setProcessingTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (processingTimeout) clearTimeout(processingTimeout);
    };
  }, [processingTimeout]);

  const setOrReplaceTimeout = (callback: () => void, ms: number) => {
    if (processingTimeout) clearTimeout(processingTimeout);
    const timeout = setTimeout(callback, ms);
    setProcessingTimeout(timeout);
  };

  const clear = () => {
    if (processingTimeout) {
      clearTimeout(processingTimeout);
      setProcessingTimeout(null);
    }
  };

  return { setOrReplaceTimeout, clear, processingTimeout, setProcessingTimeout };
};
