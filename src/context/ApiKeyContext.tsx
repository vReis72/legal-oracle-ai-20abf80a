
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
  
  const { globalApiKey, hasValidGlobalKey, loading: globalLoading } = useGlobalApiKey();

  useEffect(() => {
    console.log('🔑 ApiKeyContext: Estado atualizado', {
      globalLoading,
      hasValidGlobalKey,
      hasGlobalKey: !!globalApiKey
    });

    // Só parar de carregar quando o global key provider terminar
    if (!globalLoading) {
      setIsLoading(false);
    }
  }, [globalApiKey, hasValidGlobalKey, globalLoading]);

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
    const result = hasValidGlobalKey;
    console.log('🔍 ApiKeyContext.checkApiKey chamado:', {
      result,
      hasValidGlobalKey,
      hasKey: !!globalApiKey
    });
    return result;
  };

  if (isLoading) {
    console.log('⏳ ApiKeyContext ainda carregando...');
    return null;
  }

  const isKeyConfigured = hasValidGlobalKey;
  
  console.log("🔑 ApiKeyContext: Estado final:", {
    isKeyConfigured: isKeyConfigured ? "Configurada pelo admin" : "Não configurada",
    hasValidGlobalKey,
    globalApiKey: globalApiKey ? `${globalApiKey.substring(0, 7)}...` : 'null'
  });

  return (
    <ApiKeyContext.Provider value={{ 
      apiKey: globalApiKey, 
      setApiKey, 
      isKeyConfigured,
      checkApiKey,
      resetApiKey,
      isPlaceholderKey: false,
      isEnvironmentKey: hasValidGlobalKey
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
