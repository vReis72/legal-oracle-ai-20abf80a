
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
  const { toast } = useToast();

  // Carregar a chave da API do localStorage na inicialização
  useEffect(() => {
    const storedKey = getApiKey();
    if (storedKey) {
      setApiKeyState(storedKey);
    }
  }, []);

  const setApiKey = (key: string) => {
    if (key && key.trim()) {
      saveApiKey(key);
      setApiKeyState(key);
      toast({
        title: "API Key Configurada",
        description: "Sua chave da API OpenAI foi salva e configurada com sucesso.",
      });
    }
  };

  const checkApiKey = (): boolean => {
    return hasApiKey();
  };

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

// Hook customizado para usar o contexto da chave API
export const useApiKey = () => {
  const context = useContext(ApiKeyContext);
  if (context === undefined) {
    throw new Error('useApiKey deve ser usado dentro de um ApiKeyProvider');
  }
  return context;
};
