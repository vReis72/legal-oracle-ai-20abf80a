
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
  if (!key.startsWith('sk-')) return false;
  if (key.length < 20) return false; // Chaves reais OpenAI são longas
  return true;
};
