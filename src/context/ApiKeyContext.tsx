
import React, { createContext, useContext, ReactNode } from 'react';
import { getGlobalApiKey, hasGlobalApiKey } from '@/constants/apiKeys';

interface ApiKeyContextType {
  apiKey: string;
  isKeyConfigured: boolean;
  isPlaceholderKey: boolean;
  isEnvironmentKey: boolean;
  setApiKey: (key: string) => void;
  checkApiKey: () => boolean;
  resetApiKey: () => void;
}

const ApiKeyContext = createContext<ApiKeyContextType | undefined>(undefined);

export const useApiKey = () => {
  const context = useContext(ApiKeyContext);
  if (context === undefined) {
    throw new Error('useApiKey deve ser usado dentro de um ApiKeyProvider');
  }
  return context;
};

interface ApiKeyProviderProps {
  children: ReactNode;
}

export const ApiKeyProvider: React.FC<ApiKeyProviderProps> = ({ children }) => {
  // Usar sempre a chave global constante
  const currentKey = getGlobalApiKey();
  const isKeyConfigured = hasGlobalApiKey();
  const isPlaceholderKey = currentKey === "sk-adicione-uma-chave-valida-aqui";
  const isEnvironmentKey = false; // Sempre false pois usamos apenas constante

  const contextValue: ApiKeyContextType = {
    apiKey: currentKey,
    isKeyConfigured,
    isPlaceholderKey,
    isEnvironmentKey,
    setApiKey: () => {
      console.log('setApiKey chamado, mas usando apenas constante global');
    },
    checkApiKey: () => isKeyConfigured,
    resetApiKey: () => {
      console.log('resetApiKey chamado, mas usando apenas constante global');
    },
  };

  return (
    <ApiKeyContext.Provider value={contextValue}>
      {children}
    </ApiKeyContext.Provider>
  );
};
