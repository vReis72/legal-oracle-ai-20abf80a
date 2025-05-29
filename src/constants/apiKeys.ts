
// Constante global para a chave API OpenAI
// Esta chave será usada em todo o aplicativo
export const GLOBAL_OPENAI_API_KEY = "sk-proj-VyWgX8h9TLJdKGzMvQgDT3BlbkFJYourActualValidKeyHere";

// Função para obter a chave global
export const getGlobalApiKey = (): string => {
  return GLOBAL_OPENAI_API_KEY;
};

// Função para validar se a chave global está configurada
export const hasGlobalApiKey = (): boolean => {
  return GLOBAL_OPENAI_API_KEY && 
         GLOBAL_OPENAI_API_KEY.length > 20 && 
         GLOBAL_OPENAI_API_KEY.startsWith('sk-') &&
         !GLOBAL_OPENAI_API_KEY.includes('YourActualValidKeyHere');
};
