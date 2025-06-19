
import { useState, createContext, useContext, ReactNode, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface GlobalApiKeyContextType {
  globalApiKey: string | null;
  loading: boolean;
  hasValidGlobalKey: boolean;
  saveGlobalApiKey: (key: string) => Promise<boolean>;
  refreshGlobalApiKey: () => Promise<void>;
}

const GlobalApiKeyContext = createContext<GlobalApiKeyContextType | undefined>(undefined);

export const GlobalApiKeyProvider = ({ children }: { children: ReactNode }) => {
  const [globalApiKey, setGlobalApiKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();

  const checkSupabaseConnection = async () => {
    try {
      console.log('Testando conexão com Supabase...');
      const { data, error } = await supabase.from('system_settings').select('count').limit(1);
      if (error) {
        console.error('Erro de conexão com Supabase:', error);
        return false;
      }
      console.log('Conexão com Supabase OK');
      return true;
    } catch (error) {
      console.error('Erro ao testar conexão:', error);
      return false;
    }
  };

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
      
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Erro ao buscar chave global:', error);
        if (error.code === '42P01') {
          console.log('Tabela system_settings não existe');
        }
        setGlobalApiKey(null);
      } else {
        const apiKey = data?.openai_api_key || null;
        console.log('Chave global encontrada:', apiKey ? 'SIM' : 'NÃO');
        setGlobalApiKey(apiKey);
      }
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

      console.log('Salvando chave global...');
      
      const { data: existing } = await supabase
        .from('system_settings')
        .select('id')
        .limit(1)
        .maybeSingle();

      let result;
      
      if (existing) {
        result = await supabase
          .from('system_settings')
          .update({
            openai_api_key: key,
            updated_by: user.id,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id);
      } else {
        result = await supabase
          .from('system_settings')
          .insert({
            openai_api_key: key,
            updated_by: user.id
          });
      }

      if (result.error) {
        console.error('Erro ao salvar chave global:', result.error);
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Não foi possível salvar a chave API.",
        });
        return false;
      }

      setGlobalApiKey(key);
      console.log('Chave global salva com sucesso');
      
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

export const useGlobalApiKey = () => {
  const context = useContext(GlobalApiKeyContext);
  if (context === undefined) {
    throw new Error('useGlobalApiKey must be used within a GlobalApiKeyProvider');
  }
  return context;
};
