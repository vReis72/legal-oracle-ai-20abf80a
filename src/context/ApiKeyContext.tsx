
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { getApiKey, saveApiKey, hasApiKey, setDefaultApiKey, removeApiKey } from '@/services/apiKeyService';
import { useToast } from '@/hooks/use-toast';
import { ApiKeyContextType } from './types/apiKeyTypes';
import { isValidApiKey, getEnvironmentApiKey, PLACEHOLDER_TEXT, DEVELOPMENT_API_KEY } from './utils/apiKeyUtils';
import { useUserSettings } from '@/hooks/useUserSettings';

const ApiKeyContext = createContext<ApiKeyContextType | undefined>(undefined);

interface ApiKeyProviderProps {
  children: ReactNode;
}

// Função especial para validar chave de desenvolvimento
const isValidDevelopmentKey = (key: string | null): boolean => {
  if (!key) return false;
  // Para desenvolvimento, aceitar a chave fixa SEMPRE
  if (key === DEVELOPMENT_API_KEY) {
    console.log("✅ Chave de desenvolvimento CORRETA validada como VÁLIDA:", key.substring(0, 20) + "...");
    return true;
  }
  return isValidApiKey(key);
};

export const ApiKeyProvider: React.FC<ApiKeyProviderProps> = ({ children }) => {
  const [apiKey, setApiKeyState] = useState<string | null>(DEVELOPMENT_API_KEY);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaceholderKey, setIsPlaceholderKey] = useState(false);
  const [isEnvironmentKey, setIsEnvironmentKey] = useState(false);
  const { toast } = useToast();
  
  // Hook para gerenciar configurações do usuário no Supabase
  const { 
    apiKey: supabaseApiKey, 
    saveApiKey: saveToSupabase, 
    removeApiKey: removeFromSupabase,
    hasValidApiKey: hasValidSupabaseKey,
    isLoading: isLoadingSupabase 
  } = useUserSettings();

  // Inicialização imediata com chave de desenvolvimento CORRETA
  useEffect(() => {
    console.log("🚀 === INICIALIZANDO ApiKeyProvider ===");
    console.log("🔑 Chave de desenvolvimento CORRETA:", DEVELOPMENT_API_KEY.substring(0, 30) + "...");
    console.log("📝 Chave completa para debug:", DEVELOPMENT_API_KEY);
    
    // Verificar se há chave do ambiente (Railway) primeiro
    const ENV_API_KEY = getEnvironmentApiKey();
    if (ENV_API_KEY && isValidDevelopmentKey(ENV_API_KEY)) {
      console.log("🌐 Usando chave API do ambiente (Railway)");
      setApiKeyState(ENV_API_KEY);
      setIsEnvironmentKey(true);
      setIsPlaceholderKey(false);
      return;
    }
    
    // Usar chave de desenvolvimento CORRETA como padrão
    console.log("✅ Configurando chave de desenvolvimento CORRETA como padrão");
    setApiKeyState(DEVELOPMENT_API_KEY);
    setIsEnvironmentKey(false);
    setIsPlaceholderKey(false);
    
    // Salvar no localStorage para compatibilidade
    if (!hasApiKey()) {
      saveApiKey(DEVELOPMENT_API_KEY);
    }
    
    console.log("🎯 === Estado inicial configurado ===");
    console.log("🔑 API Key ativa:", DEVELOPMENT_API_KEY.substring(0, 30) + "...");
    console.log("✅ É válida?", isValidDevelopmentKey(DEVELOPMENT_API_KEY));
  }, []);

  const setApiKey = async (key: string) => {
    // Não permitir sobrescrever a chave do ambiente
    if (isEnvironmentKey) {
      toast({
        variant: "warning",
        title: "Operação não permitida",
        description: "Uma chave API já está configurada através de variáveis de ambiente (Railway).",
      });
      return;
    }

    if (key && key.trim()) {
      try {
        // Validação flexível para desenvolvimento
        if (!key.startsWith('sk-') && key !== DEVELOPMENT_API_KEY) {
          toast({
            variant: "destructive",
            title: "Formato inválido",
            description: "A chave API da OpenAI deve começar com 'sk-'.",
          });
          return;
        }
        
        // Tentar salvar no Supabase primeiro
        const savedToSupabase = await saveToSupabase(key);
        
        if (savedToSupabase) {
          // Se salvou no Supabase, atualizar o estado
          setApiKeyState(key);
          setIsPlaceholderKey(key === PLACEHOLDER_TEXT);
          
          // Também salvar no localStorage para compatibilidade
          saveApiKey(key);
        } else {
          // Se falhou no Supabase, salvar apenas no localStorage
          saveApiKey(key);
          setApiKeyState(key);
          setIsPlaceholderKey(key === PLACEHOLDER_TEXT);
          
          toast({
            title: "API Key Configurada (Local)",
            description: "Sua chave foi salva localmente. Recomendamos usar o banco de dados.",
          });
        }
        
        console.log("API key configurada com sucesso");
      } catch (error) {
        console.error("Erro ao salvar API key:", error);
        toast({
          variant: "destructive",
          title: "Erro ao salvar API Key",
          description: "Não foi possível salvar sua chave API. Verifique o formato e tente novamente.",
        });
      }
    }
  };

  const resetApiKey = async () => {
    // Não permitir remover a chave do ambiente
    if (isEnvironmentKey) {
      toast({
        variant: "warning",
        title: "Operação não permitida",
        description: "Não é possível remover uma chave configurada através de variáveis de ambiente (Railway).",
      });
      return;
    }

    try {
      // Tentar remover do Supabase primeiro
      const removedFromSupabase = await removeFromSupabase();
      
      // Sempre remover do localStorage também
      removeApiKey();
      
      // Restaurar chave de desenvolvimento
      console.log("Restaurando chave de desenvolvimento");
      setApiKeyState(DEVELOPMENT_API_KEY);
      setIsPlaceholderKey(false);
      saveApiKey(DEVELOPMENT_API_KEY);
      
      toast({
        title: "Chave Restaurada",
        description: "Chave de desenvolvimento restaurada automaticamente.",
      });
    } catch (error) {
      console.error("Erro ao resetar API key:", error);
    }
  };

  const checkApiKey = (): boolean => {
    // Em desenvolvimento, sempre retornar true se a chave atual é válida
    const currentKey = apiKey || DEVELOPMENT_API_KEY;
    const isValid = isValidDevelopmentKey(currentKey);
    console.log("Verificação de API key - Chave atual:", currentKey.substring(0, 30) + "...");
    console.log("Verificação de API key - É válida?", isValid);
    return isValid;
  };

  // Determinar se a chave está configurada
  const isKeyConfigured = Boolean(apiKey && isValidDevelopmentKey(apiKey));
  
  console.log("📊 === Estado atual da API Key ===");
  console.log("✅ Chave configurada:", isKeyConfigured);
  console.log("🔑 Chave sendo usada:", apiKey?.substring(0, 30) + "...");
  console.log("✅ É válida?", apiKey ? isValidDevelopmentKey(apiKey) : false);

  return (
    <ApiKeyContext.Provider value={{ 
      apiKey: apiKey || DEVELOPMENT_API_KEY, 
      setApiKey, 
      isKeyConfigured: isKeyConfigured, 
      checkApiKey,
      resetApiKey,
      isPlaceholderKey: false, // Nunca placeholder em desenvolvimento
      isEnvironmentKey: isEnvironmentKey || false
    }}>
      {children}
    </ApiKeyContext.Provider>
  );
};

// Custom hook to use the API key context
export const useApiKey = () => {
  const context = useContext(ApiKeyContext);
  if (context === undefined) {
    throw new Error('useApiKey deve ser usado dentro de um ApiKeyProvider');
  }
  return context;
};
