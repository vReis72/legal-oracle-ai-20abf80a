
import { createContext } from 'react';
import { ApiKeyContextType } from './types/apiKeyTypes';

export const ApiKeyContext = createContext<ApiKeyContextType | undefined>(undefined);

// Re-export the provider and hook
export { ApiKeyProvider } from './ApiKeyProvider';
export { useApiKey } from './hooks/useApiKey';
