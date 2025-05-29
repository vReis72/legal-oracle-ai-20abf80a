
import { getGlobalApiKey, hasGlobalApiKey } from '@/constants/apiKeys';

/**
 * Hook simples para gerenciar a chave API
 * Usa apenas a constante global configurada
 */
export const useApiKey = () => {
  const apiKey = getGlobalApiKey();
  const isConfigured = hasGlobalApiKey();
  
  console.log('🎯 useApiKey chamado:');
  console.log('  - apiKey:', apiKey.substring(0, 10) + '...');
  console.log('  - isConfigured:', isConfigured);
  console.log('  - hasValidKey:', isConfigured);
  
  return {
    apiKey,
    isConfigured,
    hasValidKey: isConfigured
  };
};
