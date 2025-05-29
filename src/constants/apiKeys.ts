
// Constante global para a chave API OpenAI
export const GLOBAL_OPENAI_API_KEY = "sk-adicione-uma-chave-valida-aqui";

// Função para obter a chave global
export const getGlobalApiKey = (): string => {
  return GLOBAL_OPENAI_API_KEY;
};

// Função para validar se a chave global está configurada
export const hasGlobalApiKey = (): boolean => {
  const key = GLOBAL_OPENAI_API_KEY;
  console.log('🔑 hasGlobalApiKey - verificando chave:', key.substring(0, 10) + '...');
  console.log('🔑 Comprimento da chave:', key.length);
  console.log('🔑 Começa com sk-?', key.startsWith('sk-'));
  console.log('🔑 É placeholder?', key.includes('adicione-uma-chave-valida-aqui'));
  
  const isValid = key && 
         key.length > 20 && 
         key.startsWith('sk-') &&
         !key.includes('adicione-uma-chave-valida-aqui');
         
  console.log('🔑 Resultado da validação:', isValid);
  return isValid;
};
