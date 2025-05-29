
import { getGlobalApiKey, hasGlobalApiKey } from '@/constants/apiKeys';

/**
 * Hook simples para gerenciar a chave API
 * Usa apenas a constante global configurada
 */
export const useApiKey = () => {
  const apiKey = getGlobalApiKey();
  const isConfigured = hasGlobalApiKey();
  
  return {
    apiKey,
    isConfigured,
    hasValidKey: isConfigured
  };
};
