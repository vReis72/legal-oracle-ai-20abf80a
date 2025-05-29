
import { getGlobalApiKey, hasGlobalApiKey } from '@/constants/apiKeys';

// Constants
export const PLACEHOLDER_TEXT = "sk-adicione-uma-chave-valida-aqui";

// Get API key from the environment (if available)
export const getEnvironmentApiKey = (): string | undefined => {
  return typeof window !== 'undefined' && window.env?.OPENAI_API_KEY;
};

// Function to check if a key is valid - mais rigorosa
export const isValidApiKey = (key: string | null): boolean => {
  if (!key) {
    console.log("❌ Validação: Chave não fornecida");
    return false;
  }
  
  if (key === PLACEHOLDER_TEXT) {
    console.log("❌ Validação: Chave é placeholder");
    return false;
  }
  
  // Validação para chaves da OpenAI
  if (!key.startsWith('sk-')) {
    console.log("❌ Validação: Chave não começa com 'sk-'");
    return false;
  }
  
  if (key.length < 40) {
    console.log("❌ Validação: Chave muito curta (menos de 40 caracteres)");
    return false;
  }

  // Verificar se não contém caracteres inválidos
  if (!/^sk-[A-Za-z0-9_-]+$/.test(key)) {
    console.log("❌ Validação: Chave contém caracteres inválidos");
    return false;
  }
  
  console.log("✅ Validação: Chave passou em todos os testes");
  return true;
};

// Função para obter a chave API prioritariamente
export const getPriorityApiKey = (): string | null => {
  // 1. Primeiro verifica se há chave do ambiente (Railway)
  const envKey = getEnvironmentApiKey();
  if (envKey && isValidApiKey(envKey)) {
    console.log("🌍 Usando chave do ambiente");
    return envKey;
  }
  
  // 2. Depois usa a chave global se estiver configurada
  if (hasGlobalApiKey()) {
    const globalKey = getGlobalApiKey();
    console.log("🌐 Tentando usar chave global");
    return globalKey;
  }
  
  console.log("❌ Nenhuma chave prioritária disponível");
  return null;
};
