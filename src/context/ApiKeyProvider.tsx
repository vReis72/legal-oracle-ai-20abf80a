
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
  const [isPlaceholderKey, setIsPlaceholderKey] = useState(true);
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
    
    if (priorityKey && isValidApiKey(priorityKey)) {
      console.log("✅ Usando chave prioritária válida:", priorityKey.substring(0, 30) + "...");
      setApiKeyState(priorityKey);
      setIsEnvironmentKey(Boolean(priorityKey));
      setIsPlaceholderKey(false);
      
      // Salvar no localStorage para compatibilidade se não existir
      if (!hasApiKey()) {
        saveApiKey(priorityKey);
      }
    } else {
      console.log("⚠️ Nenhuma chave global válida configurada");
      // Tentar carregar do localStorage como fallback
      const localKey = getApiKey();
      if (localKey && isValidApiKey(localKey)) {
        console.log("📁 Usando chave do localStorage:", localKey.substring(0, 30) + "...");
        setApiKeyState(localKey);
        setIsEnvironmentKey(false);
        setIsPlaceholderKey(false);
      } else {
        console.log("❌ Nenhuma chave válida encontrada - será necessário configurar");
        setApiKeyState(null);
        setIsEnvironmentKey(false);
        setIsPlaceholderKey(true);
      }
    }
    
    console.log("🎯 === Estado inicial configurado ===");
  }, []);

  // Sincronizar com chave do Supabase quando carregada
  useEffect(() => {
    if (!isLoadingSupabase && supabaseApiKey && isValidApiKey(supabaseApiKey)) {
      console.log("🔄 Sincronizando com chave do Supabase:", supabaseApiKey.substring(0, 30) + "...");
      setApiKeyState(supabaseApiKey);
      setIsPlaceholderKey(false);
      
      // Salvar no localStorage para compatibilidade
      if (!hasApiKey() || getApiKey() !== supabaseApiKey) {
        saveApiKey(supabaseApiKey);
      }
    }
  }, [supabaseApiKey, isLoadingSupabase]);

  // Determinar se a chave está configurada
  const currentKey = apiKey || getPriorityApiKey();
  const isKeyConfigured = Boolean(currentKey && isValidApiKey(currentKey));
  
  console.log("📊 === Estado atual da API Key ===");
  console.log("✅ Chave configurada:", isKeyConfigured);
  console.log("🔑 Chave sendo usada:", currentKey?.substring(0, 30) + "...");
  console.log("✅ É válida?", currentKey ? isValidApiKey(currentKey) : false);
  console.log("🔧 É placeholder?", isPlaceholderKey);

  return (
    <ApiKeyContext.Provider value={{ 
      apiKey: currentKey, 
      setApiKey, 
      isKeyConfigured, 
      checkApiKey,
      resetApiKey,
      isPlaceholderKey,
      isEnvironmentKey: isEnvironmentKey || false
    }}>
      {children}
    </ApiKeyContext.Provider>
  );
};
