
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

  // Função para validar e configurar uma chave
  const validateAndSetKey = (key: string | null, source: string) => {
    if (!key) {
      console.log(`❌ ${source}: Chave não fornecida`);
      return false;
    }

    console.log(`🔍 ${source}: Validando chave ${key.substring(0, 20)}...`);
    
    if (isValidApiKey(key)) {
      console.log(`✅ ${source}: Chave válida detectada`);
      setApiKeyState(key);
      setIsPlaceholderKey(false);
      setIsEnvironmentKey(source === 'Ambiente/Global');
      return true;
    } else {
      console.log(`❌ ${source}: Chave inválida`);
      return false;
    }
  };

  // Inicialização com priorização de chaves
  useEffect(() => {
    console.log("🚀 === INICIALIZANDO ApiKeyProvider ===");
    
    // 1. Verificar chave prioritária (ambiente ou global)
    const priorityKey = getPriorityApiKey();
    if (validateAndSetKey(priorityKey, 'Ambiente/Global')) {
      // Sincronizar com localStorage se necessário
      if (!hasApiKey() || getApiKey() !== priorityKey) {
        saveApiKey(priorityKey!);
      }
      console.log("🎯 Usando chave prioritária");
      return;
    }
    
    // 2. Verificar localStorage como fallback
    const localKey = getApiKey();
    if (validateAndSetKey(localKey, 'localStorage')) {
      console.log("🎯 Usando chave do localStorage");
      return;
    }
    
    // 3. Nenhuma chave válida encontrada
    console.log("❌ Nenhuma chave válida encontrada - necessário configurar");
    setApiKeyState(null);
    setIsEnvironmentKey(false);
    setIsPlaceholderKey(true);
    
    console.log("🎯 === Estado inicial configurado ===");
  }, []);

  // Sincronizar com chave do Supabase quando carregada
  useEffect(() => {
    if (!isLoadingSupabase && supabaseApiKey) {
      if (validateAndSetKey(supabaseApiKey, 'Supabase')) {
        // Sincronizar com localStorage
        if (!hasApiKey() || getApiKey() !== supabaseApiKey) {
          saveApiKey(supabaseApiKey);
        }
        console.log("🔄 Sincronizado com Supabase");
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
  console.log("🌍 É do ambiente?", isEnvironmentKey);

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
