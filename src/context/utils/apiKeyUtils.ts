
// Constants
export const PLACEHOLDER_TEXT = "sk-adicione-uma-chave-valida-aqui";

// CHAVE FIXA PARA DESENVOLVIMENTO
const DEVELOPMENT_API_KEY = "sk-proj-GJmI8dqzZjD0__TtbvGzONwFCCnm9JtKxBQJZAJKiOV6xm88dUV2LxYlMYYT3BlbKcCWz4_VGPET3BlbkFJkEhv3xJOvZa-2hv-d-VHZX15qIhXVIRlAGP8k9bYc9H9uIJbKaJjUJJjkJJ-dKJkJjKJjKJ";

// Get API key from the environment (if available)
export const getEnvironmentApiKey = (): string | undefined => {
  return typeof window !== 'undefined' && window.env?.OPENAI_API_KEY;
};

// Function to check if a key is valid (modificada para desenvolvimento)
export const isValidApiKey = (key: string | null): boolean => {
  if (!key) return false;
  if (key === PLACEHOLDER_TEXT) return false;
  
  // Para desenvolvimento, aceitar a chave fixa
  if (key === DEVELOPMENT_API_KEY) return true;
  
  // Validação normal para outras chaves
  if (!key.startsWith('sk-')) return false;
  if (key.length < 20) return false; // Chaves reais OpenAI são longas
  return true;
};
