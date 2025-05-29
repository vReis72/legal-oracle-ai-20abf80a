
import React, { useState, useEffect, ReactNode } from 'react';
import { getApiKey, saveApiKey, hasApiKey, removeApiKey } from '@/services/apiKeyService';
import { useToast } from '@/hooks/use-toast';
import { isValidApiKey, getPriorityApiKey } from './utils/apiKeyUtils';
import { useUserSettings } from '@/hooks/useUserSettings';
import { ApiKeyContext } from './ApiKeyContext';
import { useApiKeyOperations } from './hooks/useApiKeyOperations';

interface ApiKeyProviderProps {
  children: ReactNode;
}

export const ApiKeyProvider: React.FC<ApiKeyProviderProps> = ({ children }) => {
  const [apiKey, setApiKeyState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaceholderKey, setIsPlaceholderKey] = useState(false);
  const [isEnvironmentKey, setIsEnvironmentKey] = useState(false);
  const { toast } = useToast();
  
  // Hook para gerenciar configurações do usuário no Supabase
  const { 
    apiKey: supabaseApiKey, 
    saveApiKey: saveToSupabase, 
    removeApiKey: removeFromSupabase,
    hasValidApiKey: hasValidSupabaseKey,
    isLoading: isLoadingSupabase 
  } = useUserSettings();

  const { setApiKey, resetApiKey, checkApiKey } = useApiKeyOperations({
    apiKey,
    setApiKeyState,
    setIsPlaceholderKey,
    isEnvironmentKey,
    saveToSupabase,
    removeFromSupabase,
    toast
  });

  // Inicialização com chave global/ambiente
  useEffect(() => {
    console.log("🚀 === INICIALIZANDO ApiKeyProvider ===");
    
    // Usar a chave prioritária (ambiente ou global)
    const priorityKey = getPriorityApiKey();
    
    if (priorityKey) {
      console.log("✅ Usando chave prioritária:", priorityKey.substring(0, 30) + "...");
      setApiKeyState(priorityKey);
      setIsEnvironmentKey(Boolean(priorityKey));
      setIsPlaceholderKey(false);
      
      // Salvar no localStorage para compatibilidade
      if (!hasApiKey()) {
        saveApiKey(priorityKey);
      }
    } else {
      console.log("⚠️ Nenhuma chave global configurada");
      setApiKeyState(null);
      setIsEnvironmentKey(false);
      setIsPlaceholderKey(true);
    }
    
    console.log("🎯 === Estado inicial configurado ===");
    console.log("🔑 API Key ativa:", priorityKey?.substring(0, 30) + "...");
    console.log("✅ É válida?", priorityKey ? isValidApiKey(priorityKey) : false);
  }, []);

  // Determinar se a chave está configurada
  const isKeyConfigured = Boolean(apiKey && isValidApiKey(apiKey));
  
  console.log("📊 === Estado atual da API Key ===");
  console.log("✅ Chave configurada:", isKeyConfigured);
  console.log("🔑 Chave sendo usada:", apiKey?.substring(0, 30) + "...");
  console.log("✅ É válida?", apiKey ? isValidApiKey(apiKey) : false);

  return (
    <ApiKeyContext.Provider value={{ 
      apiKey: apiKey || getPriorityApiKey(), 
      setApiKey, 
      isKeyConfigured: isKeyConfigured, 
      checkApiKey,
      resetApiKey,
      isPlaceholderKey: !isKeyConfigured,
      isEnvironmentKey: isEnvironmentKey || false
    }}>
      {children}
    </ApiKeyContext.Provider>
  );
};
