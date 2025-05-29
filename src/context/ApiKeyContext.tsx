
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { getApiKey, saveApiKey, hasApiKey, setDefaultApiKey, removeApiKey } from '@/services/apiKeyService';
import { useToast } from '@/hooks/use-toast';
import { ApiKeyContextType } from './types/apiKeyTypes';
import { isValidApiKey, getEnvironmentApiKey, PLACEHOLDER_TEXT, getPriorityApiKey } from './utils/apiKeyUtils';
import { useUserSettings } from '@/hooks/useUserSettings';
import { getGlobalApiKey, hasGlobalApiKey } from '@/constants/apiKeys';

const ApiKeyContext = createContext<ApiKeyContextType | undefined>(undefined);

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

  // Inicialização com chave global/ambiente
  useEffect(() => {
    console.log("🚀 === INICIALIZANDO ApiKeyProvider ===");
    
    // Usar a chave prioritária (ambiente ou global)
    const priorityKey = getPriorityApiKey();
    
    if (priorityKey) {
      console.log("✅ Usando chave prioritária:", priorityKey.substring(0, 30) + "...");
      setApiKeyState(priorityKey);
      setIsEnvironmentKey(Boolean(getEnvironmentApiKey()));
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

  const setApiKey = async (key: string) => {
    // Não permitir sobrescrever a chave do ambiente
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
        // Validação para chaves da OpenAI
        if (!key.startsWith('sk-')) {
          toast({
            variant: "destructive",
            title: "Formato inválido",
            description: "A chave API da OpenAI deve começar com 'sk-'.",
          });
          return;
        }
        
        // Tentar salvar no Supabase primeiro
        const savedToSupabase = await saveToSupabase(key);
        
        if (savedToSupabase) {
          // Se salvou no Supabase, atualizar o estado
          setApiKeyState(key);
          setIsPlaceholderKey(key === PLACEHOLDER_TEXT);
          
          // Também salvar no localStorage para compatibilidade
          saveApiKey(key);
        } else {
          // Se falhou no Supabase, salvar apenas no localStorage
          saveApiKey(key);
          setApiKeyState(key);
          setIsPlaceholderKey(key === PLACEHOLDER_TEXT);
          
          toast({
            title: "API Key Configurada (Local)",
            description: "Sua chave foi salva localmente. Recomendamos usar o banco de dados.",
          });
        }
        
        console.log("API key configurada com sucesso");
      } catch (error) {
        console.error("Erro ao salvar API key:", error);
        toast({
          variant: "destructive",
          title: "Erro ao salvar API Key",
          description: "Não foi possível salvar sua chave API. Verifique o formato e tente novamente.",
        });
      }
    }
  };

  const resetApiKey = async () => {
    // Não permitir remover a chave do ambiente
    if (isEnvironmentKey) {
      toast({
        variant: "warning",
        title: "Operação não permitida",
        description: "Não é possível remover uma chave configurada através de variáveis de ambiente (Railway).",
      });
      return;
    }

    try {
      // Tentar remover do Supabase primeiro
      const removedFromSupabase = await removeFromSupabase();
      
      // Sempre remover do localStorage também
      removeApiKey();
      
      // Restaurar chave global se disponível
      const globalKey = getPriorityApiKey();
      if (globalKey) {
        console.log("Restaurando chave global");
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
      console.error("Erro ao resetar API key:", error);
    }
  };

  const checkApiKey = (): boolean => {
    const currentKey = apiKey || getPriorityApiKey();
    const isValid = isValidApiKey(currentKey);
    console.log("Verificação de API key - Chave atual:", currentKey?.substring(0, 30) + "...");
    console.log("Verificação de API key - É válida?", isValid);
    return isValid;
  };

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

// Custom hook to use the API key context
export const useApiKey = () => {
  const context = useContext(ApiKeyContext);
  if (context === undefined) {
    throw new Error('useApiKey deve ser usado dentro de um ApiKeyProvider');
  }
  return context;
};
