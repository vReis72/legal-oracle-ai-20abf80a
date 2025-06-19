
import { useState, ReactNode, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { GlobalApiKeyContext } from './GlobalApiKeyContext';
import { checkSupabaseConnection, fetchGlobalApiKeyFromDb, saveGlobalApiKeyToDb } from './globalApiKeyService';

export const GlobalApiKeyProvider = ({ children }: { children: ReactNode }) => {
  const [globalApiKey, setGlobalApiKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();

  const fetchGlobalApiKey = async () => {
    if (loading || initialized || authLoading || !user) {
      return;
    }
    
    try {
      setLoading(true);
      console.log('Iniciando fetchGlobalApiKey para usuário autenticado...');
      
      const isConnected = await checkSupabaseConnection();
      if (!isConnected) {
        console.error('Sem conexão com Supabase, cancelando busca da chave');
        setGlobalApiKey(null);
        setLoading(false);
        setInitialized(true);
        return;
      }

      console.log('Usuário autenticado, buscando chave global...');
      
      const apiKey = await fetchGlobalApiKeyFromDb();
      setGlobalApiKey(apiKey);
    } catch (error) {
      console.error('Erro inesperado ao buscar chave global:', error);
      setGlobalApiKey(null);
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  };

  // Reset state quando usuário faz logout
  useEffect(() => {
    if (!user && !authLoading) {
      console.log('Usuário não autenticado, resetando estado da chave global');
      setGlobalApiKey(null);
      setLoading(false);
      setInitialized(false);
    }
  }, [user, authLoading]);

  // Buscar chave quando usuário estiver autenticado
  useEffect(() => {
    if (user && !authLoading && !initialized) {
      fetchGlobalApiKey();
    }
  }, [user, authLoading, initialized]);

  const saveGlobalApiKey = async (key: string): Promise<boolean> => {
    try {
      if (!user) {
        console.error('Usuário não autenticado ao salvar chave');
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Usuário não autenticado.",
        });
        return false;
      }

      const success = await saveGlobalApiKeyToDb(key, user.id);
      
      if (!success) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Não foi possível salvar a chave API.",
        });
        return false;
      }

      setGlobalApiKey(key);
      
      toast({
        title: "Sucesso",
        description: "Chave API OpenAI salva com sucesso!",
      });
      return true;
    } catch (error) {
      console.error('Erro inesperado ao salvar chave:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro inesperado ao salvar a chave API.",
      });
      return false;
    }
  };

  const refreshGlobalApiKey = async () => {
    if (user) {
      setInitialized(false);
      await fetchGlobalApiKey();
    }
  };

  const hasValidGlobalKey = Boolean(
    globalApiKey && 
    globalApiKey.trim() !== '' && 
    globalApiKey.startsWith('sk-') && 
    globalApiKey.length > 20
  );

  console.log('Estado da chave global:', {
    hasKey: !!globalApiKey,
    isValid: hasValidGlobalKey,
    loading,
    initialized,
    userAuthenticated: !!user,
    authLoading
  });

  return (
    <GlobalApiKeyContext.Provider value={{
      globalApiKey,
      loading,
      hasValidGlobalKey,
      saveGlobalApiKey,
      refreshGlobalApiKey
    }}>
      {children}
    </GlobalApiKeyContext.Provider>
  );
};
