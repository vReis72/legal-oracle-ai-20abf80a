
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { getApiKey, saveApiKey, hasApiKey, setDefaultApiKey, removeApiKey } from '@/services/apiKeyService';
import { useToast } from '@/hooks/use-toast';

interface ApiKeyContextType {
  apiKey: string | null;
  setApiKey: (key: string) => void;
  isKeyConfigured: boolean;
  checkApiKey: () => boolean;
  resetApiKey: () => void;
  isPlaceholderKey: boolean;
  isEnvironmentKey: boolean;
}

const ApiKeyContext = createContext<ApiKeyContextType | undefined>(undefined);

interface ApiKeyProviderProps {
  children: ReactNode;
}

// Obter chave da API do ambiente (configurado pelo Railway) ou usar a chave padrão
const ENV_API_KEY = typeof window !== 'undefined' && window.env?.OPENAI_API_KEY;
const DEFAULT_API_KEY = ENV_API_KEY || "";
const PLACEHOLDER_TEXT = "sk-adicione-uma-chave-valida-aqui";

// Função para verificar se a chave é um placeholder ou está vazia
const isValidApiKey = (key: string | null): boolean => {
  if (!key) return false;
  if (key === PLACEHOLDER_TEXT) return false;
  if (!key.startsWith('sk-')) return false;
  if (key.length < 20) return false; // Chaves reais OpenAI são longas
  return true;
};

export const ApiKeyProvider: React.FC<ApiKeyProviderProps> = ({ children }) => {
  const [apiKey, setApiKeyState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaceholderKey, setIsPlaceholderKey] = useState(false);
  const [isEnvironmentKey, setIsEnvironmentKey] = useState(false);
  const { toast } = useToast();

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

  // Verificar se há chave API no ambiente primeiro
  useEffect(() => {
    // Prioridade 1: Chave do ambiente (Railway)
    if (ENV_API_KEY && isValidApiKey(ENV_API_KEY)) {
      console.log("Usando chave API do ambiente (Railway)");
      try {
        // Atualizar o estado para usar a chave do ambiente
        setApiKeyState(ENV_API_KEY);
        setIsEnvironmentKey(true);
        setIsPlaceholderKey(false);
        console.log("API key do ambiente configurada automaticamente");
      } catch (error) {
        console.error("Erro ao definir chave do ambiente:", error);
      }
    } 
    // Prioridade 2: Chave do localStorage
    else if (hasApiKey()) {
      console.log("Usando chave API do localStorage");
      updateApiKeyFromStorage();
    }
    // Prioridade 3: Chave padrão (se fornecida)
    else if (DEFAULT_API_KEY && DEFAULT_API_KEY !== PLACEHOLDER_TEXT) {
      try {
        console.log("Configurando chave padrão...");
        // Remover chave antiga para garantir que a nova será usada
        removeApiKey();
        // Definir a nova chave
        if (setDefaultApiKey(DEFAULT_API_KEY)) {
          console.log("API key padrão configurada automaticamente");
          updateApiKeyFromStorage();
        }
      } catch (error) {
        console.error("Erro ao definir chave padrão:", error);
      }
    } else {
      // Se não tivermos nenhuma chave válida, configuramos o estado para refletir isso
      setIsPlaceholderKey(true);
    }
    
    setIsLoading(false);
  }, []);

  // Escutar eventos de atualização da chave
  useEffect(() => {
    const handleApiKeyUpdate = () => {
      // Só atualize do localStorage se não estivermos usando uma chave do ambiente
      if (!isEnvironmentKey) {
        updateApiKeyFromStorage();
      }
    };
    
    window.addEventListener('apikey_updated', handleApiKeyUpdate);
    
    return () => {
      window.removeEventListener('apikey_updated', handleApiKeyUpdate);
    };
  }, [isEnvironmentKey]);

  const setApiKey = (key: string) => {
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
        
        saveApiKey(key);
        setApiKeyState(key);
        setIsPlaceholderKey(key === PLACEHOLDER_TEXT);
        
        toast({
          title: "API Key Configurada",
          description: "Sua chave da API OpenAI foi salva e configurada com sucesso.",
        });
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

  const resetApiKey = () => {
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
      // Remover chave atual
      removeApiKey();
      // Limpar estados
      setApiKeyState(null);
      setIsPlaceholderKey(true);
      
      toast({
        title: "Chave API Removida",
        description: "A chave API foi removida com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao resetar API key:", error);
    }
  };

  const checkApiKey = (): boolean => {
    // Se temos uma chave do ambiente, ela tem prioridade
    if (isEnvironmentKey && isValidApiKey(apiKey)) {
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
                          (apiKey !== null && apiKey !== PLACEHOLDER_TEXT && isValidApiKey(apiKey));
  
  console.log("Estado atual da API key:", isKeyConfigured ? "Configurada" : "Não configurada");
  console.log("Fonte da API key:", isEnvironmentKey ? "Ambiente (Railway)" : "Local Storage");

  return (
    <ApiKeyContext.Provider value={{ 
      apiKey, 
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
