
import { createContext, useContext } from 'react';
import { GlobalApiKeyContextType } from './types';

export const GlobalApiKeyContext = createContext<GlobalApiKeyContextType | undefined>(undefined);

export const useGlobalApiKey = () => {
  const context = useContext(GlobalApiKeyContext);
  if (context === undefined) {
    throw new Error('useGlobalApiKey must be used within a GlobalApiKeyProvider');
  }
  return context;
};
