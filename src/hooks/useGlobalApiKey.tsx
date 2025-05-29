
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';

interface SystemSettings {
  id: string;
  openai_api_key: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

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
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchGlobalApiKey = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Erro ao buscar chave global:', error);
        setGlobalApiKey(null);
        return;
      }

      if (data?.openai_api_key) {
        setGlobalApiKey(data.openai_api_key);
      } else {
        setGlobalApiKey(null);
      }
    } catch (error) {
      console.error('Erro inesperado ao buscar chave global:', error);
      setGlobalApiKey(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchGlobalApiKey();
    } else {
      setGlobalApiKey(null);
      setLoading(false);
    }
  }, [user]);

  const saveGlobalApiKey = async (key: string): Promise<boolean> => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Usuário não autenticado.",
      });
      return false;
    }

    try {
      // Verificar se já existe uma configuração
      const { data: existing } = await supabase
        .from('system_settings')
        .select('id')
        .limit(1)
        .maybeSingle();

      let result;
      
      if (existing) {
        // Atualizar configuração existente
        result = await supabase
          .from('system_settings')
          .update({
            openai_api_key: key,
            updated_by: user.id,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id);
      } else {
        // Criar nova configuração
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
    await fetchGlobalApiKey();
  };

  const hasValidGlobalKey = globalApiKey !== null && 
                            globalApiKey.trim() !== '' && 
                            globalApiKey.startsWith('sk-') && 
                            globalApiKey !== 'sk-adicione-uma-chave-valida-aqui';

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
