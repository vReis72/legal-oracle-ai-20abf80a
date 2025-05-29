
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { getApiKey, saveApiKey, hasApiKey, setDefaultApiKey, removeApiKey } from '@/services/apiKeyService';
import { useToast } from '@/hooks/use-toast';
import { ApiKeyContextType } from './types/apiKeyTypes';
import { isValidApiKey, getEnvironmentApiKey, PLACEHOLDER_TEXT } from './utils/apiKeyUtils';
import { useUserSettings } from '@/hooks/useUserSettings';

const ApiKeyContext = createContext<ApiKeyContextType | undefined>(undefined);

interface ApiKeyProviderProps {
  children: ReactNode;
}

// CHAVE FIXA PARA DESENVOLVIMENTO - REMOVER EM PRODUÇÃO
const DEVELOPMENT_API_KEY = "sk-proj-GJmI8dqzZjD0__TtbvGzONwFCCnm9JtKxBQJZAJKiOV6xm88dUV2LxYlMYYT3BlbKcCWz4_VGPET3BlbkFJkEhv3xJOvZa-2hv-d-VHZX15qIhXVIRlAGP8k9bYc9H9uIJbKaJjUJJjkJJ-dKJkJjKJjKJ";

export const ApiKeyProvider: React.FC<ApiKeyProviderProps> = ({ children }) => {
  const [apiKey, setApiKeyState] = useState<string | null>(DEVELOPMENT_API_KEY);
  const [isLoading, setIsLoading] = useState(false); // Mudança: não precisa carregar
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

  // Inicialização imediata com chave de desenvolvimento
  useEffect(() => {
    console.log("Inicializando ApiKeyProvider com chave de desenvolvimento");
    
    // Verificar se há chave do ambiente (Railway) primeiro
    const ENV_API_KEY = getEnvironmentApiKey();
    if (ENV_API_KEY && isValidApiKey(ENV_API_KEY)) {
      console.log("Usando chave API do ambiente (Railway)");
      setApiKeyState(ENV_API_KEY);
      setIsEnvironmentKey(true);
      setIsPlaceholderKey(false);
      return;
    }
    
    // Usar chave de desenvolvimento como padrão
    if (DEVELOPMENT_API_KEY && isValidApiKey(DEVELOPMENT_API_KEY)) {
      console.log("Usando chave API de desenvolvimento fixa");
      setApiKeyState(DEVELOPMENT_API_KEY);
      setIsEnvironmentKey(false);
      setIsPlaceholderKey(false);
      
      // Salvar no localStorage para compatibilidade
      if (!hasApiKey()) {
        saveApiKey(DEVELOPMENT_API_KEY);
      }
      return;
    }
    
    // Se por algum motivo a chave de desenvolvimento não for válida
    console.warn("Chave de desenvolvimento não é válida, usando fallback");
    setIsPlaceholderKey(true);
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
        // Validação adicional
        if (!key.startsWith('sk-')) {
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
      if (DEVELOPMENT_API_KEY && isValidApiKey(DEVELOPMENT_API_KEY)) {
        setApiKeyState(DEVELOPMENT_API_KEY);
        setIsPlaceholderKey(false);
        saveApiKey(DEVELOPMENT_API_KEY);
        
        toast({
          title: "Chave Restaurada",
          description: "Chave de desenvolvimento restaurada automaticamente.",
        });
      } else {
        // Limpar estados
        setApiKeyState(null);
        setIsPlaceholderKey(true);
        
        if (removedFromSupabase) {
          toast({
            title: "Chave API Removida",
            description: "A chave API foi removida do banco de dados com sucesso.",
          });
        } else {
          toast({
            title: "Chave API Removida (Local)",
            description: "A chave API foi removida localmente.",
          });
        }
      }
    } catch (error) {
      console.error("Erro ao resetar API key:", error);
    }
  };

  const checkApiKey = (): boolean => {
    // Se temos uma chave do ambiente, ela tem prioridade
    if (isEnvironmentKey && isValidApiKey(apiKey)) {
      return true;
    }
    
    // Se temos a chave de desenvolvimento, usar ela (sempre válida em dev)
    if (DEVELOPMENT_API_KEY && isValidApiKey(DEVELOPMENT_API_KEY)) {
      return true;
    }
    
    // Se temos uma chave válida do Supabase
    if (hasValidSupabaseKey() && isValidApiKey(supabaseApiKey)) {
      return true;
    }
    
    // Caso contrário, verificar o localStorage
    const storedKey = getApiKey();
    const hasValidKey = hasApiKey() && storedKey !== PLACEHOLDER_TEXT && isValidApiKey(storedKey);
    console.log("Verificação de API key:", hasValidKey ? "Configurada" : "Não configurada");
    return hasValidKey;
  };

  // Determinar se a chave está configurada (sempre true em desenvolvimento)
  const isKeyConfigured = (isEnvironmentKey && isValidApiKey(apiKey)) || 
                          (DEVELOPMENT_API_KEY && isValidApiKey(DEVELOPMENT_API_KEY)) ||
                          (hasValidSupabaseKey() && isValidApiKey(supabaseApiKey)) ||
                          (apiKey !== null && apiKey !== PLACEHOLDER_TEXT && isValidApiKey(apiKey));
  
  console.log("Estado atual da API key:", isKeyConfigured ? "Configurada" : "Não configurada");
  console.log("Fonte da API key:", 
    isEnvironmentKey ? "Ambiente (Railway)" : 
    (DEVELOPMENT_API_KEY && isValidApiKey(DEVELOPMENT_API_KEY)) ? "Desenvolvimento (Fixa)" :
    hasValidSupabaseKey() ? "Supabase (Banco)" : 
    "Local Storage"
  );

  return (
    <ApiKeyContext.Provider value={{ 
      apiKey: apiKey || supabaseApiKey || DEVELOPMENT_API_KEY, 
      setApiKey, 
      isKeyConfigured: true, // Sempre true em desenvolvimento
      checkApiKey: () => true, // Sempre true em desenvolvimento
      resetApiKey,
      isPlaceholderKey: false, // Nunca placeholder em desenvolvimento
      isEnvironmentKey: isEnvironmentKey || (DEVELOPMENT_API_KEY && isValidApiKey(DEVELOPMENT_API_KEY))
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
