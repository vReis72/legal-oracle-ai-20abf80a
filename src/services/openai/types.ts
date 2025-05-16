
/**
 * Common types for OpenAI services
 */

/**
 * Interface for search result data structure
 */
export interface SearchResult {
  id: string;
  tribunal: string;
  processo: string;
  relator: string;
  data: string;
  ementa: string;
  relevancia: number;
  tags: string[];
}

/**
 * Common error handling utilities
 */
export const handleApiError = async (response: Response): Promise<void> => {
  const errorData = await response.json().catch(() => ({ error: { message: 'Erro desconhecido' } }));
  console.error("Erro na API OpenAI:", errorData);
  
  // Handle common HTTP errors with more specific messages
  if (response.status === 401) {
    throw new Error("API key inválida ou expirada. Verifique suas credenciais.");
  } else if (response.status === 429) {
    throw new Error("Limite de requisições excedido. Tente novamente mais tarde.");
  } else if (response.status === 500) {
    throw new Error("Erro no servidor OpenAI. Tente novamente mais tarde.");
  } else {
    throw new Error(`Erro na API: ${response.status} - ${errorData.error?.message || 'Erro desconhecido'}`);
  }
};

/**
 * Validates the OpenAI API key
 */
export const validateApiKey = (apiKey: string): void => {
  if (!apiKey) {
    throw new Error("API key não fornecida. Configure sua chave OpenAI nas configurações.");
  }
};
