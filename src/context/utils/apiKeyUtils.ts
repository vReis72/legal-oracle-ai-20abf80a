
// Constants
export const PLACEHOLDER_TEXT = "sk-adicione-uma-chave-valida-aqui";

// CHAVE TEMPORÁRIA PARA TESTE - será substituída por uma válida
const DEVELOPMENT_API_KEY = "sk-test-development-key-placeholder";

// Get API key from the environment (if available)
export const getEnvironmentApiKey = (): string | undefined => {
  return typeof window !== 'undefined' && window.env?.OPENAI_API_KEY;
};

// Function to check if a key is valid (modificada para desenvolvimento)
export const isValidApiKey = (key: string | null): boolean => {
  if (!key) return false;
  if (key === PLACEHOLDER_TEXT) return false;
  
  // Para desenvolvimento, aceitar a chave fixa SEMPRE
  if (key === DEVELOPMENT_API_KEY) {
    console.log("✅ Chave de desenvolvimento detectada e validada como VÁLIDA");
    return true;
  }
  
  // Validação normal para outras chaves
  if (!key.startsWith('sk-')) return false;
  if (key.length < 20) return false;
  return true;
};

// Export da chave para uso em outros módulos
export { DEVELOPMENT_API_KEY };
