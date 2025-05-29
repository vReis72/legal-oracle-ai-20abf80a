
import React, { useState, useEffect, ReactNode } from 'react';
import { getApiKey, saveApiKey, hasApiKey, removeApiKey } from '@/services/apiKeyService';
import { useToast } from '@/hooks/use-toast';
import { isValidApiKey, getPriorityApiKey } from './utils/apiKeyUtils';
import { useSystemSettings } from '@/hooks/useSystemSettings';
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
  
  // Hook para gerenciar configurações do sistema
  const { 
    getApiKey: getGlobalApiKey, 
    isLoading: isLoadingSystem 
  } = useSystemSettings();

  const { setApiKey, resetApiKey, checkApiKey } = useApiKeyOperations({
    apiKey,
    setApiKeyState,
    setIsPlaceholderKey,
    isEnvironmentKey,
    saveToSupabase: async () => false, // Não usado mais
    removeFromSupabase: async () => false, // Não usado mais
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
      setIsEnvironmentKey(source === 'Ambiente');
      return true;
    } else {
      console.log(`❌ ${source}: Chave inválida`);
      return false;
    }
  };

  // Inicialização com priorização de chaves
  useEffect(() => {
    console.log("🚀 === INICIALIZANDO ApiKeyProvider ===");
    
    // 1. Verificar chave prioritária (ambiente)
    const envPriorityKey = getPriorityApiKey();
    if (validateAndSetKey(envPriorityKey, 'Ambiente')) {
      // Sincronizar com localStorage se necessário
      if (!hasApiKey() || getApiKey() !== envPriorityKey) {
        saveApiKey(envPriorityKey!);
      }
      console.log("🎯 Usando chave prioritária (ambiente)");
      return;
    }
    
    // 2. Verificar localStorage como fallback
    const localKey = getApiKey();
    if (validateAndSetKey(localKey, 'localStorage')) {
      console.log("🎯 Usando chave do localStorage");
      return;
    }
    
    // 3. Nenhuma chave válida encontrada
    console.log("❌ Nenhuma chave válida encontrada - aguardando carregamento do sistema");
    setApiKeyState(null);
    setIsEnvironmentKey(false);
    setIsPlaceholderKey(true);
    
    console.log("🎯 === Estado inicial configurado ===");
  }, []);

  // Sincronizar com chave global do sistema quando carregada
  useEffect(() => {
    if (!isLoadingSystem) {
      console.log('🔄 Verificando chave global do sistema...');
      const globalKey = getGlobalApiKey();
      
      if (globalKey && validateAndSetKey(globalKey, 'Sistema Global')) {
        // Sincronizar com localStorage
        if (!hasApiKey() || getApiKey() !== globalKey) {
          saveApiKey(globalKey);
        }
        console.log("🔄 Sincronizado com chave global do sistema");
      } else if (!globalKey && apiKey) {
        // Se não há chave global mas há uma local, limpar
        console.log("🔄 Removendo chave local (sem chave global configurada)");
        setApiKeyState(null);
        setIsPlaceholderKey(true);
        setIsEnvironmentKey(false);
        removeApiKey();
      } else if (!globalKey && !apiKey) {
        // Nenhuma chave disponível
        console.log("❌ Nenhuma chave global configurada pelo administrador");
        setApiKeyState(null);
        setIsPlaceholderKey(true);
        setIsEnvironmentKey(false);
      }
    }
  }, [getGlobalApiKey, isLoadingSystem]);

  // Determinar se a chave está configurada
  const envKey = getPriorityApiKey();
  const globalKey = getGlobalApiKey();
  const currentKey = envKey || globalKey || apiKey;
  const isKeyConfigured = Boolean(currentKey && isValidApiKey(currentKey));
  
  console.log("📊 === Estado atual da API Key ===");
  console.log("✅ Chave configurada:", isKeyConfigured);
  console.log("🔑 Chave sendo usada:", currentKey?.substring(0, 30) + "...");
  console.log("✅ É válida?", currentKey ? isValidApiKey(currentKey) : false);
  console.log("🔧 É placeholder?", isPlaceholderKey);
  console.log("🌍 É do ambiente?", isEnvironmentKey);
  console.log("🔄 Carregando Sistema?", isLoadingSystem);

  return (
    <ApiKeyContext.Provider value={{ 
      apiKey: currentKey, 
      setApiKey, 
      isKeyConfigured, 
      checkApiKey,
      resetApiKey,
      isPlaceholderKey: isPlaceholderKey && !isKeyConfigured,
      isEnvironmentKey: isEnvironmentKey || false
    }}>
      {children}
    </ApiKeyContext.Provider>
  );
};
