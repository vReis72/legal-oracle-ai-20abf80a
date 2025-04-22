
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { getApiKey, saveApiKey, hasApiKey, setDefaultApiKey } from '@/services/apiKeyService';
import { useToast } from '@/hooks/use-toast';

interface ApiKeyContextType {
  apiKey: string | null;
  setApiKey: (key: string) => void;
  isKeyConfigured: boolean;
  checkApiKey: () => boolean;
}

const ApiKeyContext = createContext<ApiKeyContextType | undefined>(undefined);

interface ApiKeyProviderProps {
  children: ReactNode;
}

// Chave padrão (pode ser configurada para uma chave de teste ou para a chave fornecida)
const DEFAULT_API_KEY = "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";

export const ApiKeyProvider: React.FC<ApiKeyProviderProps> = ({ children }) => {
  const [apiKey, setApiKeyState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Função para atualizar o estado da chave baseado no localStorage
  const updateApiKeyFromStorage = () => {
    try {
      const storedKey = getApiKey();
      if (storedKey) {
        setApiKeyState(storedKey);
        console.log("API key carregada do localStorage");
      } else {
        console.log("Nenhuma API key encontrada no localStorage");
      }
    } catch (error) {
      console.error("Erro ao carregar API key:", error);
    }
  };

  // Carregar API key do localStorage na inicialização
  useEffect(() => {
    try {
      // Tentar carregar a chave existente
      updateApiKeyFromStorage();
      
      // Se não houver chave, definir a padrão
      if (!hasApiKey() && DEFAULT_API_KEY) {
        if (setDefaultApiKey(DEFAULT_API_KEY)) {
          console.log("API key padrão configurada automaticamente");
          updateApiKeyFromStorage();
        }
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
        saveApiKey(key);
        setApiKeyState(key);
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

  const checkApiKey = (): boolean => {
    const hasKey = hasApiKey();
    console.log("Verificação de API key:", hasKey ? "Configurada" : "Não configurada");
    return hasKey;
  };

  // Se ainda estamos carregando, não renderiza nada
  if (isLoading) {
    return null;
  }

  const isKeyConfigured = !!apiKey || hasApiKey();
  console.log("Estado atual da API key:", isKeyConfigured ? "Configurada" : "Não configurada");

  return (
    <ApiKeyContext.Provider value={{ 
      apiKey, 
      setApiKey, 
      isKeyConfigured: isKeyConfigured,
      checkApiKey
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
