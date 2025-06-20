
import { useState, ReactNode, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { GlobalApiKeyContext } from './GlobalApiKeyContext';
import { checkSupabaseConnection, fetchGlobalApiKeyFromDb, saveGlobalApiKeyToDb } from './globalApiKeyService';

export const GlobalApiKeyProvider = ({ children }: { children: ReactNode }) => {
  const [globalApiKey, setGlobalApiKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();

  const fetchGlobalApiKey = async (attempt = 1) => {
    try {
      console.log(`🚀 [Tentativa ${attempt}] Iniciando busca da chave global...`);
      console.log('🔐 Estado da autenticação:', { 
        authLoading, 
        hasUser: !!user, 
        userEmail: user?.email 
      });
      
      const isConnected = await checkSupabaseConnection();
      if (!isConnected) {
        console.error('❌ Sem conexão com Supabase, tentando novamente em 2s...');
        if (attempt < 3) {
          setTimeout(() => fetchGlobalApiKey(attempt + 1), 2000);
          return;
        }
        setGlobalApiKey(null);
        return;
      }

      const apiKey = await fetchGlobalApiKeyFromDb();
      console.log(`📊 [Tentativa ${attempt}] Resultado da busca:`, {
        hasKey: !!apiKey,
        keyLength: apiKey?.length,
        keyPreview: apiKey ? `${apiKey.substring(0, 7)}...${apiKey.slice(-4)}` : 'NENHUMA'
      });
      
      setGlobalApiKey(apiKey);
      setRetryCount(0);
    } catch (error) {
      console.error(`💥 [Tentativa ${attempt}] Erro ao buscar chave global:`, error);
      
      if (attempt < 3) {
        console.log(`🔄 Tentando novamente em 2s... (tentativa ${attempt + 1}/3)`);
        setTimeout(() => fetchGlobalApiKey(attempt + 1), 2000);
        return;
      }
      
      setGlobalApiKey(null);
      toast({
        variant: "destructive",
        title: "Erro ao carregar configurações",
        description: "Não foi possível carregar a chave API global. Algumas funcionalidades podem estar limitadas.",
      });
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  };

  // Aguardar autenticação completar antes de buscar chave
  useEffect(() => {
    console.log('🎯 GlobalApiKeyProvider: Effect triggered', {
      authLoading,
      initialized,
      hasUser: !!user
    });

    // Só inicializar quando a autenticação estiver completa (não loading)
    if (!authLoading && !initialized) {
      console.log('✅ Autenticação completa, iniciando busca da chave...');
      fetchGlobalApiKey();
    }
  }, [authLoading, initialized]);

  // Retry automático quando o usuário for carregado (caso inicial tenha falhado)
  useEffect(() => {
    if (user && !globalApiKey && retryCount < 2 && initialized) {
      console.log('🔄 Usuário carregado, tentando buscar chave novamente...');
      setRetryCount(prev => prev + 1);
      setTimeout(() => fetchGlobalApiKey(), 1000);
    }
  }, [user, globalApiKey, retryCount, initialized]);

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

      console.log('💾 Salvando chave global...', {
        userEmail: user.email,
        keyLength: key.length
      });

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
      console.log('✅ Chave salva e estado atualizado');
      
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
    console.log('🔄 Forçando refresh da chave global...');
    setInitialized(false);
    setLoading(true);
    setRetryCount(0);
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
    authLoading,
    keyLength: globalApiKey?.length,
    keyPreview: globalApiKey ? `${globalApiKey.substring(0, 7)}...${globalApiKey.slice(-4)}` : 'NENHUMA',
    retryCount
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
