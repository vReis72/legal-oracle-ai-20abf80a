
// apiKeyService.ts - Serviço centralizado para gerenciamento da chave API

// Nome da chave no localStorage
const API_KEY_NAME = 'openai_api_key';

// Chave de placeholder para identificação
const PLACEHOLDER_KEY = 'sk-adicione-uma-chave-valida-aqui';

/**
 * Obtém a chave API armazenada
 * @returns A chave da API ou null se não estiver definida
 */
export const getApiKey = (): string | null => {
  try {
    const key = localStorage.getItem(API_KEY_NAME);
    // Verificação adicional para garantir que uma chave vazia não seja considerada válida
    return key && key.trim() !== '' ? key : null;
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
      
      // Disparar um evento personalizado para notificar que a chave foi salva
      window.dispatchEvent(new CustomEvent('apikey_updated', { detail: key }));
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
 * Verifica se a chave API é válida (não é placeholder)
 * @returns true se a chave é válida, false caso contrário
 */
export const isValidKey = (): boolean => {
  try {
    const key = getApiKey();
    if (!key) return false;
    if (key === PLACEHOLDER_KEY) return false;
    if (!key.startsWith('sk-')) return false;
    return true;
  } catch (error) {
    console.error('Erro ao validar API key:', error);
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
    
    // Disparar um evento personalizado para notificar que a chave foi removida
    window.dispatchEvent(new CustomEvent('apikey_updated', { detail: null }));
  } catch (error) {
    console.error('Erro ao remover do localStorage:', error);
  }
};

/**
 * Define uma chave API padrão se nenhuma estiver configurada
 * @param defaultKey A chave padrão a ser usada
 */
export const setDefaultApiKey = (defaultKey: string): boolean => {
  if (!hasApiKey() && defaultKey && defaultKey.trim() !== '') {
    try {
      // Forçar a remoção de qualquer chave antiga primeiro
      removeApiKey(); 
      // Pequena pausa para garantir que a remoção seja concluída
      setTimeout(() => {
        saveApiKey(defaultKey);
      }, 100);
      return true;
    } catch (error) {
      console.error('Erro ao definir chave padrão:', error);
      return false;
    }
  }
  return false;
};

// Função para limpar cache e forçar nova leitura da chave (para depuração)
export const refreshApiKey = (): void => {
  try {
    const key = getApiKey();
    if (key) {
      // Remove e salva novamente para forçar atualização
      removeApiKey();
      setTimeout(() => saveApiKey(key), 100);
    }
  } catch (error) {
    console.error('Erro ao atualizar API key:', error);
  }
};
