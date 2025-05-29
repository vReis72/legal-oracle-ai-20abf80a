
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

// Obter chave da API do ambiente (configurado pelo Railway) ou usar a chave padrão
const DEFAULT_API_KEY = getEnvironmentApiKey() || "";

export const ApiKeyProvider: React.FC<ApiKeyProviderProps> = ({ children }) => {
  const [apiKey, setApiKeyState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
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

  // Função para atualizar o estado da chave baseado no localStorage
  const updateApiKeyFromStorage = () => {
    try {
      const storedKey = getApiKey();
      if (storedKey) {
        setApiKeyState(storedKey);
        setIsPlaceholderKey(storedKey === PLACEHOLDER_TEXT);
        console.log("API key carregada do localStorage");
      } else {
        console.log("Nenhuma API key encontrada no localStorage");
        setIsPlaceholderKey(false);
      }
    } catch (error) {
      console.error("Erro ao carregar API key:", error);
      setIsPlaceholderKey(false);
    }
  };

  // Verificar se há chave API e definir prioridades
  useEffect(() => {
    if (isLoadingSupabase) return; // Aguarda o Supabase carregar

    // Prioridade 1: Chave do ambiente (Railway)
    const ENV_API_KEY = getEnvironmentApiKey();
    if (ENV_API_KEY && isValidApiKey(ENV_API_KEY)) {
      console.log("Usando chave API do ambiente (Railway)");
      setApiKeyState(ENV_API_KEY);
      setIsEnvironmentKey(true);
      setIsPlaceholderKey(false);
      setIsLoading(false);
      return;
    }
    
    // Prioridade 2: Chave do Supabase (banco de dados)
    if (supabaseApiKey && hasValidSupabaseKey()) {
      console.log("Usando chave API do Supabase");
      setApiKeyState(supabaseApiKey);
      setIsEnvironmentKey(false);
      setIsPlaceholderKey(false);
      setIsLoading(false);
      return;
    }
    
    // Prioridade 3: Chave do localStorage (compatibilidade)
    if (hasApiKey()) {
      console.log("Usando chave API do localStorage");
      updateApiKeyFromStorage();
      setIsLoading(false);
      return;
    }
    
    // Prioridade 4: Chave padrão (se fornecida)
    if (DEFAULT_API_KEY && DEFAULT_API_KEY !== PLACEHOLDER_TEXT) {
      try {
        console.log("Configurando chave padrão...");
        removeApiKey();
        if (setDefaultApiKey(DEFAULT_API_KEY)) {
          console.log("API key padrão configurada automaticamente");
          updateApiKeyFromStorage();
        }
      } catch (error) {
        console.error("Erro ao definir chave padrão:", error);
      }
    } else {
      // Se não tivermos nenhuma chave válida
      setIsPlaceholderKey(true);
    }
    
    setIsLoading(false);
  }, [isLoadingSupabase, supabaseApiKey, hasValidSupabaseKey]);

  // Escutar eventos de atualização da chave
  useEffect(() => {
    const handleApiKeyUpdate = () => {
      if (!isEnvironmentKey && !hasValidSupabaseKey()) {
        updateApiKeyFromStorage();
      }
    };
    
    window.addEventListener('apikey_updated', handleApiKeyUpdate);
    
    return () => {
      window.removeEventListener('apikey_updated', handleApiKeyUpdate);
    };
  }, [isEnvironmentKey, hasValidSupabaseKey]);

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
    } catch (error) {
      console.error("Erro ao resetar API key:", error);
    }
  };

  const checkApiKey = (): boolean => {
    // Se temos uma chave do ambiente, ela tem prioridade
    if (isEnvironmentKey && isValidApiKey(apiKey)) {
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

  // Se ainda estamos carregando, não renderiza nada
  if (isLoading) {
    return null;
  }

  const isKeyConfigured = (isEnvironmentKey && isValidApiKey(apiKey)) || 
                          (hasValidSupabaseKey() && isValidApiKey(supabaseApiKey)) ||
                          (apiKey !== null && apiKey !== PLACEHOLDER_TEXT && isValidApiKey(apiKey));
  
  console.log("Estado atual da API key:", isKeyConfigured ? "Configurada" : "Não configurada");
  console.log("Fonte da API key:", 
    isEnvironmentKey ? "Ambiente (Railway)" : 
    hasValidSupabaseKey() ? "Supabase (Banco)" : 
    "Local Storage"
  );

  return (
    <ApiKeyContext.Provider value={{ 
      apiKey: apiKey || supabaseApiKey, 
      setApiKey, 
      isKeyConfigured,
      checkApiKey,
      resetApiKey,
      isPlaceholderKey,
      isEnvironmentKey
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
