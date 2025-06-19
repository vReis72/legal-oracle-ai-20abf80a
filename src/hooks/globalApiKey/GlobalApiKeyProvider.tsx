
import { useState, ReactNode, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { GlobalApiKeyContext } from './GlobalApiKeyContext';
import { checkSupabaseConnection, fetchGlobalApiKeyFromDb, saveGlobalApiKeyToDb } from './globalApiKeyService';

export const GlobalApiKeyProvider = ({ children }: { children: ReactNode }) => {
  const [globalApiKey, setGlobalApiKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();

  const fetchGlobalApiKey = async () => {
    try {
      console.log('🚀 Iniciando busca da chave global...');
      
      const isConnected = await checkSupabaseConnection();
      if (!isConnected) {
        console.error('❌ Sem conexão com Supabase, cancelando busca da chave');
        setGlobalApiKey(null);
        return;
      }

      const apiKey = await fetchGlobalApiKeyFromDb();
      console.log('📊 Resultado da busca:', apiKey ? 'CHAVE ENCONTRADA' : 'NENHUMA CHAVE');
      setGlobalApiKey(apiKey);
    } catch (error) {
      console.error('💥 Erro inesperado ao buscar chave global:', error);
      setGlobalApiKey(null);
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  };

  // Buscar chave independente do estado de autenticação
  useEffect(() => {
    if (!initialized) {
      fetchGlobalApiKey();
    }
  }, [initialized]);

  const saveGlobalApiKey = async (key: string): Promise<boolean> => {
    try {
      if (!user) {
        console.error('❌ Usuário não autenticado ao salvar chave');
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
      console.error('💥 Erro inesperado ao salvar chave:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro inesperado ao salvar a chave API.",
      });
      return false;
    }
  };

  const refreshGlobalApiKey = async () => {
    setInitialized(false);
    setLoading(true);
    await fetchGlobalApiKey();
  };

  const hasValidGlobalKey = Boolean(
    globalApiKey && 
    globalApiKey.trim() !== '' && 
    globalApiKey.startsWith('sk-') && 
    globalApiKey.length > 20
  );

  console.log('🎯 Estado FINAL da chave global:', {
    hasKey: !!globalApiKey,
    isValid: hasValidGlobalKey,
    loading,
    initialized,
    keyLength: globalApiKey?.length,
    keyPreview: globalApiKey ? `${globalApiKey.substring(0, 7)}...${globalApiKey.slice(-4)}` : 'NENHUMA'
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
