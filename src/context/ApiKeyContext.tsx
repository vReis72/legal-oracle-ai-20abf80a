
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { getApiKey, saveApiKey, hasApiKey, setDefaultApiKey, removeApiKey } from '@/services/apiKeyService';
import { useToast } from '@/hooks/use-toast';

interface ApiKeyContextType {
  apiKey: string | null;
  setApiKey: (key: string) => void;
  isKeyConfigured: boolean;
  checkApiKey: () => boolean;
  resetApiKey: () => void;
  isPlaceholderKey: boolean; // Nova propriedade para indicar se é chave placeholder
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
    if (ENV_API_KEY && isValidApiKey(ENV_API_KEY)) {
      console.log("Usando chave API do ambiente (Railway)");
      try {
        removeApiKey();
        if (setDefaultApiKey(ENV_API_KEY)) {
          console.log("API key do ambiente configurada automaticamente");
          updateApiKeyFromStorage();
        }
      } catch (error) {
        console.error("Erro ao definir chave do ambiente:", error);
      }
    } 
    // Caso contrário, usar a chave padrão (se fornecida)
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
  }, []);

  // Carregar API key do localStorage na inicialização
  useEffect(() => {
    try {
      // Tentar carregar a chave existente
      updateApiKeyFromStorage();
      
      // Se não houver chave e o usuário ainda não viu a mensagem de placeholder
      if (!hasApiKey() && !isPlaceholderKey) {
        setIsPlaceholderKey(true);
      }
    } catch (error) {
      console.error("Erro ao inicializar API key:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Escutar eventos de atualização da chave
  useEffect(() => {
    const handleApiKeyUpdate = () => {
      updateApiKeyFromStorage();
    };
    
    window.addEventListener('apikey_updated', handleApiKeyUpdate);
    
    return () => {
      window.removeEventListener('apikey_updated', handleApiKeyUpdate);
    };
  }, []);

  const setApiKey = (key: string) => {
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
    const storedKey = getApiKey();
    const hasValidKey = hasApiKey() && storedKey !== PLACEHOLDER_TEXT && isValidApiKey(storedKey);
    console.log("Verificação de API key:", hasValidKey ? "Configurada" : "Não configurada");
    return hasValidKey;
  };

  // Se ainda estamos carregando, não renderiza nada
  if (isLoading) {
    return null;
  }

  const isKeyConfigured = apiKey !== null && apiKey !== PLACEHOLDER_TEXT && isValidApiKey(apiKey);
  console.log("Estado atual da API key:", isKeyConfigured ? "Configurada" : "Não configurada");

  return (
    <ApiKeyContext.Provider value={{ 
      apiKey, 
      setApiKey, 
      isKeyConfigured,
      checkApiKey,
      resetApiKey,
      isPlaceholderKey
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
