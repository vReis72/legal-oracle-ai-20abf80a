
import React, { createContext, useContext, ReactNode } from 'react';

// Chave API constante - simplesmente isso
const API_KEY = "sk-adicione-uma-chave-valida-aqui";

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
  // Chave do ambiente se existir
  const envKey = typeof window !== 'undefined' && window.env?.OPENAI_API_KEY;
  
  // Usar chave do ambiente ou constante
  const currentKey = envKey || API_KEY;
  const isEnvironmentKey = !!envKey;
  const isPlaceholderKey = currentKey === "sk-adicione-uma-chave-valida-aqui";
  const isKeyConfigured = currentKey.startsWith('sk-') && currentKey.length > 40 && !isPlaceholderKey;

  const contextValue: ApiKeyContextType = {
    apiKey: currentKey,
    isKeyConfigured,
    isPlaceholderKey,
    isEnvironmentKey,
    setApiKey: () => {}, // Não faz nada - é constante
    checkApiKey: () => isKeyConfigured,
    resetApiKey: () => {}, // Não faz nada - é constante
  };

  return (
    <ApiKeyContext.Provider value={contextValue}>
      {children}
    </ApiKeyContext.Provider>
  );
};
