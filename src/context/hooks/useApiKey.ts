
import { useContext } from 'react';
import { ApiKeyContext } from '../ApiKeyContext';

// Custom hook to use the API key context
export const useApiKey = () => {
  console.log('🔍 useApiKey: Tentando acessar contexto ApiKey...');
  const context = useContext(ApiKeyContext);
  
  if (context === undefined) {
    console.error('❌ useApiKey: Contexto ApiKeyContext não encontrado!');
    console.error('❌ Certifique-se de que o componente está envolvido por ApiKeyProvider');
    throw new Error('useApiKey deve ser usado dentro de um ApiKeyProvider');
  }
  
  console.log('✅ useApiKey: Contexto encontrado com sucesso');
  return context;
};
