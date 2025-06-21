
import { useState, ReactNode } from 'react';
import { GlobalApiKeyContext } from './GlobalApiKeyContext';
import { supabase } from '@/integrations/supabase/client';

export const GlobalApiKeyProvider = ({ children }: { children: ReactNode }) => {
  const [globalApiKey, setGlobalApiKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchApiKey = async (): Promise<string | null> => {
    try {
      const { data } = await supabase
        .from('system_settings')
        .select('openai_api_key')
        .limit(1)
        .maybeSingle();

      const key = data?.openai_api_key || null;
      setGlobalApiKey(key);
      return key;
    } catch (error) {
      console.error('Erro ao buscar chave:', error);
      return null;
    }
  };

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

      if (!result.error) {
        setGlobalApiKey(key);
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  };

  const refreshGlobalApiKey = async () => {
    setLoading(true);
    await fetchApiKey();
    setLoading(false);
  };

  return (
    <GlobalApiKeyContext.Provider value={{
      globalApiKey,
      loading,
      hasValidGlobalKey: false, // Sempre false para não fazer verificações
      saveGlobalApiKey,
      refreshGlobalApiKey
    }}>
      {children}
    </GlobalApiKeyContext.Provider>
  );
};
