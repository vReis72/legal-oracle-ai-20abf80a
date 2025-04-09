
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { getApiKey, saveApiKey, hasApiKey } from '@/services/apiKeyService';
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

export const ApiKeyProvider: React.FC<ApiKeyProviderProps> = ({ children }) => {
  const [apiKey, setApiKeyState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Load API key from localStorage on initialization
  useEffect(() => {
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
    } finally {
      setIsLoading(false);
    }
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

  if (isLoading) {
    return null;
  }

  return (
    <ApiKeyContext.Provider value={{ 
      apiKey, 
      setApiKey, 
      isKeyConfigured: !!apiKey,
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
