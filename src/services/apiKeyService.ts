
// apiKeyService.ts - Serviço centralizado para gerenciamento da chave API

// Nome da chave no localStorage
const API_KEY_NAME = 'openai_api_key';

/**
 * Obtém a chave API armazenada
 * @returns A chave da API ou null se não estiver definida
 */
export const getApiKey = (): string | null => {
  try {
    return localStorage.getItem(API_KEY_NAME);
  } catch (error) {
    console.error('Erro ao acessar localStorage:', error);
    return null;
  }
};

/**
 * Salva a chave API no armazenamento local
 * @param key A chave API para salvar
 */
export const saveApiKey = (key: string): void => {
  try {
    if (key && key.trim()) {
      localStorage.setItem(API_KEY_NAME, key.trim());
      console.log('API Key salva com sucesso no localStorage');
    }
  } catch (error) {
    console.error('Erro ao salvar no localStorage:', error);
    throw new Error('Não foi possível salvar a chave API');
  }
};

/**
 * Verifica se a chave API está configurada
 * @returns true se a chave está configurada, false caso contrário
 */
export const hasApiKey = (): boolean => {
  try {
    const key = getApiKey();
    return key !== null && key.trim() !== '';
  } catch (error) {
    console.error('Erro ao verificar API key:', error);
    return false;
  }
};

/**
 * Remove a chave API do armazenamento local
 */
export const removeApiKey = (): void => {
  try {
    localStorage.removeItem(API_KEY_NAME);
    console.log('API Key removida do localStorage');
  } catch (error) {
    console.error('Erro ao remover do localStorage:', error);
  }
};
