
// apiKeyService.ts - Serviço centralizado para gerenciamento da chave API

// Nome da chave no localStorage
const API_KEY_NAME = 'openai_api_key';

/**
 * Obtém a chave API armazenada
 * @returns A chave da API ou null se não estiver definida
 */
export const getApiKey = (): string | null => {
  return localStorage.getItem(API_KEY_NAME);
};

/**
 * Salva a chave API no armazenamento local
 * @param key A chave API para salvar
 */
export const saveApiKey = (key: string): void => {
  if (key && key.trim()) {
    localStorage.setItem(API_KEY_NAME, key.trim());
  }
};

/**
 * Verifica se a chave API está configurada
 * @returns true se a chave está configurada, false caso contrário
 */
export const hasApiKey = (): boolean => {
  const key = getApiKey();
  return key !== null && key.trim() !== '';
};

/**
 * Remove a chave API do armazenamento local
 */
export const removeApiKey = (): void => {
  localStorage.removeItem(API_KEY_NAME);
};
