
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';
import { ApiKeyContextType } from './types/apiKeyTypes';
import { useGlobalApiKey } from '@/hooks/useGlobalApiKey';

const ApiKeyContext = createContext<ApiKeyContextType | undefined>(undefined);

interface ApiKeyProviderProps {
  children: ReactNode;
}

export const ApiKeyProvider: React.FC<ApiKeyProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  // Apenas usar a chave global do admin
  const { globalApiKey, hasValidGlobalKey } = useGlobalApiKey();

  useEffect(() => {
    // Simples: apenas esperar a chave global carregar
    setIsLoading(false);
  }, [globalApiKey]);

  // Funções simplificadas - apenas para admins
  const setApiKey = async (key: string) => {
    toast({
      variant: "warning",
      title: "Operação não permitida",
      description: "Apenas administradores podem configurar a chave API do sistema.",
    });
  };

  const resetApiKey = async () => {
    toast({
      variant: "warning", 
      title: "Operação não permitida",
      description: "Apenas administradores podem gerenciar a chave API do sistema.",
    });
  };

  const checkApiKey = (): boolean => {
    return hasValidGlobalKey;
  };

  if (isLoading) {
    return null;
  }

  const isKeyConfigured = hasValidGlobalKey;
  
  console.log("Estado da API key:", isKeyConfigured ? "Configurada pelo admin" : "Não configurada");

  return (
    <ApiKeyContext.Provider value={{ 
      apiKey: globalApiKey, 
      setApiKey, 
      isKeyConfigured,
      checkApiKey,
      resetApiKey,
      isPlaceholderKey: false, // Nunca é placeholder no novo sistema
      isEnvironmentKey: hasValidGlobalKey // Se tem chave global, é "do ambiente"
    }}>
      {children}
    </ApiKeyContext.Provider>
  );
};

export const useApiKey = () => {
  const context = useContext(ApiKeyContext);
  if (context === undefined) {
    throw new Error('useApiKey deve ser usado dentro de um ApiKeyProvider');
  }
  return context;
};
