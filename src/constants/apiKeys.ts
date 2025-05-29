
// Constante global para a chave API OpenAI
export const GLOBAL_OPENAI_API_KEY = "sk-adicione-uma-chave-valida-aqui";

// Função para obter a chave global
export const getGlobalApiKey = (): string => {
  return GLOBAL_OPENAI_API_KEY;
};

// Função para validar se a chave global está configurada
export const hasGlobalApiKey = (): boolean => {
  return GLOBAL_OPENAI_API_KEY && 
         GLOBAL_OPENAI_API_KEY.length > 20 && 
         GLOBAL_OPENAI_API_KEY.startsWith('sk-') &&
         !GLOBAL_OPENAI_API_KEY.includes('adicione-uma-chave-valida-aqui');
};
