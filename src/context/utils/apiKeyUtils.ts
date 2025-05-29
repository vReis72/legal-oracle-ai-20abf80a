
import { getGlobalApiKey, hasGlobalApiKey } from '@/constants/apiKeys';

// Constants
export const PLACEHOLDER_TEXT = "sk-adicione-uma-chave-valida-aqui";

// Get API key from the environment (if available)
export const getEnvironmentApiKey = (): string | undefined => {
  return typeof window !== 'undefined' && window.env?.OPENAI_API_KEY;
};

// Function to check if a key is valid
export const isValidApiKey = (key: string | null): boolean => {
  if (!key) return false;
  if (key === PLACEHOLDER_TEXT) return false;
  
  // Validação normal para chaves
  if (!key.startsWith('sk-')) return false;
  if (key.length < 20) return false;
  return true;
};

// Função para obter a chave API prioritariamente
export const getPriorityApiKey = (): string | null => {
  // 1. Primeiro verifica se há chave do ambiente (Railway)
  const envKey = getEnvironmentApiKey();
  if (envKey && isValidApiKey(envKey)) {
    return envKey;
  }
  
  // 2. Depois usa a chave global se estiver configurada
  if (hasGlobalApiKey()) {
    return getGlobalApiKey();
  }
  
  return null;
};
