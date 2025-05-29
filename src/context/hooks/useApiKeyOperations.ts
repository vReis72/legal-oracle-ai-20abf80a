
import { useToast } from '@/hooks/use-toast';
import { saveApiKey, removeApiKey } from '@/services/apiKeyService';
import { isValidApiKey, getPriorityApiKey, PLACEHOLDER_TEXT, getEnvironmentApiKey } from '../utils/apiKeyUtils';

interface UseApiKeyOperationsProps {
  apiKey: string | null;
  setApiKeyState: (key: string | null) => void;
  setIsPlaceholderKey: (value: boolean) => void;
  isEnvironmentKey: boolean;
  saveToSupabase: (key: string) => Promise<boolean>;
  removeFromSupabase: () => Promise<boolean>;
  toast: ReturnType<typeof useToast>['toast'];
}

export const useApiKeyOperations = ({
  apiKey,
  setApiKeyState,
  setIsPlaceholderKey,
  isEnvironmentKey,
  saveToSupabase,
  removeFromSupabase,
  toast
}: UseApiKeyOperationsProps) => {
  
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

  return {
    setApiKey,
    resetApiKey,
    checkApiKey
  };
};
