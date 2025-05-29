
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getApiKey, saveApiKey, hasApiKey, removeApiKey } from '@/services/apiKeyService';
import { useToast } from '@/hooks/use-toast';
import { isValidApiKey, getPriorityApiKey } from './utils/apiKeyUtils';

interface ApiKeyContextType {
  apiKey: string | null;
  setApiKey: (key: string) => void;
  isKeyConfigured: boolean;
  checkApiKey: () => boolean;
  resetApiKey: () => void;
  isPlaceholderKey: boolean;
  isEnvironmentKey: boolean;
}

const ApiKeyContext = createContext<ApiKeyContextType | undefined>(undefined);

// Custom hook to use the API key context
export const useApiKey = () => {
  console.log('🔍 useApiKey: Tentando acessar contexto ApiKey...');
  const context = useContext(ApiKeyContext);
  
  if (context === undefined) {
    console.error('❌ useApiKey: Contexto ApiKeyContext não encontrado!');
    console.error('❌ Certifique-se de que o componente está envolvido por ApiKeyProvider');
    console.error('❌ Stack trace:', new Error().stack);
    throw new Error('useApiKey deve ser usado dentro de um ApiKeyProvider');
  }
  
  console.log('✅ useApiKey: Contexto encontrado com sucesso');
  return context;
};

interface ApiKeyProviderProps {
  children: ReactNode;
}

export const ApiKeyProvider: React.FC<ApiKeyProviderProps> = ({ children }) => {
  console.log('🚀 ApiKeyProvider: Inicializando...');
  
  const [apiKey, setApiKeyState] = useState<string | null>(null);
  const [isPlaceholderKey, setIsPlaceholderKey] = useState(true);
  const [isEnvironmentKey, setIsEnvironmentKey] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const { toast } = useToast();

  // Função simples para configurar chave
  const setApiKey = async (key: string) => {
    if (isEnvironmentKey) {
      toast({
        variant: "warning",
        title: "Operação não permitida",
        description: "Uma chave API já está configurada através de variáveis de ambiente (Railway).",
      });
      return;
    }

    if (key && key.trim()) {
      try {
        if (!key.startsWith('sk-')) {
          toast({
            variant: "destructive",
            title: "Formato inválido",
            description: "A chave API da OpenAI deve começar com 'sk-'.",
          });
          return;
        }
        
        saveApiKey(key);
        setApiKeyState(key);
        setIsPlaceholderKey(key === 'sk-adicione-uma-chave-valida-aqui');
        
        toast({
          title: "API Key Configurada",
          description: "Sua chave da API OpenAI foi salva com sucesso.",
        });
        
        console.log("✅ API key configurada com sucesso");
      } catch (error) {
        console.error("❌ Erro ao salvar API key:", error);
        toast({
          variant: "destructive",
          title: "Erro ao salvar API Key",
          description: "Não foi possível salvar sua chave API. Verifique o formato e tente novamente.",
        });
      }
    }
  };

  const resetApiKey = async () => {
    if (isEnvironmentKey) {
      toast({
        variant: "warning",
        title: "Operação não permitida",
        description: "Não é possível remover uma chave configurada através de variáveis de ambiente (Railway).",
      });
      return;
    }

    try {
      removeApiKey();
      const globalKey = getPriorityApiKey();
      
      if (globalKey) {
        console.log("🔄 Restaurando chave global");
        setApiKeyState(globalKey);
        setIsPlaceholderKey(false);
        saveApiKey(globalKey);
        
        toast({
          title: "Chave Restaurada",
          description: "Chave global restaurada automaticamente.",
        });
      } else {
        setApiKeyState(null);
        setIsPlaceholderKey(true);
        
        toast({
          title: "Chave Removida",
          description: "Configure uma nova chave API para usar o sistema.",
        });
      }
    } catch (error) {
      console.error("❌ Erro ao resetar API key:", error);
    }
  };

  const checkApiKey = (): boolean => {
    const currentKey = apiKey || getPriorityApiKey();
    const isValid = isValidApiKey(currentKey);
    console.log("🔍 Verificação de API key - Chave atual:", currentKey?.substring(0, 30) + "...");
    console.log("🔍 Verificação de API key - É válida?", isValid);
    return isValid;
  };

  // Inicialização simples - apenas uma vez
  useEffect(() => {
    if (initialized) return;
    
    console.log("🚀 === INICIALIZANDO ApiKeyProvider (UMA VEZ) ===");
    
    // 1. Verificar chave prioritária (ambiente)
    const envPriorityKey = getPriorityApiKey();
    if (envPriorityKey && isValidApiKey(envPriorityKey)) {
      console.log("🌍 Usando chave prioritária (ambiente)");
      setApiKeyState(envPriorityKey);
      setIsPlaceholderKey(false);
      setIsEnvironmentKey(true);
      
      // Sincronizar com localStorage se necessário
      if (!hasApiKey() || getApiKey() !== envPriorityKey) {
        saveApiKey(envPriorityKey);
      }
    } else {
      // 2. Verificar localStorage como fallback
      const localKey = getApiKey();
      if (localKey && isValidApiKey(localKey)) {
        console.log("💾 Usando chave do localStorage");
        setApiKeyState(localKey);
        setIsPlaceholderKey(false);
        setIsEnvironmentKey(false);
      } else {
        // 3. Nenhuma chave válida encontrada
        console.log("❌ Nenhuma chave válida encontrada");
        setApiKeyState(null);
        setIsEnvironmentKey(false);
        setIsPlaceholderKey(true);
      }
    }
    
    setInitialized(true);
    console.log("✅ === ApiKeyProvider inicializado ===");
  }, [initialized]);

  // Determinar estado atual
  const envKey = getPriorityApiKey();
  const currentKey = envKey || apiKey;
  const isKeyConfigured = Boolean(currentKey && isValidApiKey(currentKey));
  
  console.log("📊 Estado atual da API Key:");
  console.log("✅ Chave configurada:", isKeyConfigured);
  console.log("🔑 Chave sendo usada:", currentKey ? currentKey.substring(0, 30) + "..." : 'nenhuma');
  console.log("🔧 É placeholder?", isPlaceholderKey);
  console.log("🌍 É do ambiente?", isEnvironmentKey);

  const contextValue = { 
    apiKey: currentKey, 
    setApiKey, 
    isKeyConfigured, 
    checkApiKey,
    resetApiKey,
    isPlaceholderKey: isPlaceholderKey && !isKeyConfigured,
    isEnvironmentKey: isEnvironmentKey || false
  };

  return (
    <ApiKeyContext.Provider value={contextValue}>
      {children}
    </ApiKeyContext.Provider>
  );
};
