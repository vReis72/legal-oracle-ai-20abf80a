
import { useState, ReactNode, useEffect } from 'react';
import { GlobalApiKeyContext } from './GlobalApiKeyContext';
import { supabase } from '@/integrations/supabase/client';

export const GlobalApiKeyProvider = ({ children }: { children: ReactNode }) => {
  const [globalApiKey, setGlobalApiKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    const checkApiKey = async () => {
      try {
        const { data } = await supabase
          .from('system_settings')
          .select('openai_api_key')
          .limit(1)
          .maybeSingle();

        if (isMounted) {
          setGlobalApiKey(data?.openai_api_key || null);
          setLoading(false);
        }
      } catch (error) {
        console.error('❌ Erro ao verificar chave:', error);
        if (isMounted) {
          setGlobalApiKey(null);
          setLoading(false);
        }
      }
    };

    checkApiKey();
    
    return () => {
      isMounted = false;
    };
  }, []);

  const saveGlobalApiKey = async (key: string): Promise<boolean> => {
    try {
      const { data: existing } = await supabase
        .from('system_settings')
        .select('id')
        .limit(1)
        .maybeSingle();

      let result;
      
      if (existing) {
        result = await supabase
          .from('system_settings')
          .update({ openai_api_key: key })
          .eq('id', existing.id);
      } else {
        result = await supabase
          .from('system_settings')
          .insert({ openai_api_key: key });
      }

      if (result.error) {
        return false;
      }

      setGlobalApiKey(key);
      return true;
    } catch (error) {
      return false;
    }
  };

  const refreshGlobalApiKey = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('system_settings')
        .select('openai_api_key')
        .limit(1)
        .maybeSingle();
      
      setGlobalApiKey(data?.openai_api_key || null);
    } catch (error) {
      console.error('❌ Erro ao atualizar:', error);
    } finally {
      setLoading(false);
    }
  };

  const hasValidGlobalKey = !!globalApiKey;

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
