
import { useState, ReactNode, useEffect } from 'react';
import { GlobalApiKeyContext } from './GlobalApiKeyContext';
import { supabase } from '@/integrations/supabase/client';

export const GlobalApiKeyProvider = ({ children }: { children: ReactNode }) => {
  const [globalApiKey, setGlobalApiKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Verificação simples e direta na tabela system_settings
  useEffect(() => {
    const checkApiKey = async () => {
      try {
        console.log('🔑 Verificando chave API na tabela system_settings...');
        
        const { data, error } = await supabase
          .from('system_settings')
          .select('openai_api_key')
          .limit(1)
          .maybeSingle();

        if (error) {
          console.error('❌ Erro ao verificar chave API:', error);
          setGlobalApiKey(null);
        } else {
          const apiKey = data?.openai_api_key || null;
          setGlobalApiKey(apiKey);
          console.log('🔑 Chave API encontrada:', apiKey ? 'SIM - Sistema habilitado' : 'NÃO - Sistema desabilitado');
        }
      } catch (error) {
        console.error('💥 Erro inesperado:', error);
        setGlobalApiKey(null);
      } finally {
        setLoading(false);
      }
    };

    checkApiKey();
  }, []);

  const saveGlobalApiKey = async (key: string): Promise<boolean> => {
    try {
      console.log('💾 Salvando nova chave API...');
      
      // Verificar se já existe configuração
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
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id);
      } else {
        result = await supabase
          .from('system_settings')
          .insert({
            openai_api_key: key
          });
      }

      if (result.error) {
        console.error('❌ Erro ao salvar chave:', result.error);
        return false;
      }

      setGlobalApiKey(key);
      console.log('✅ Chave salva com sucesso - Sistema habilitado');
      return true;
    } catch (error) {
      console.error('💥 Erro ao salvar chave:', error);
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
      
      const apiKey = data?.openai_api_key || null;
      setGlobalApiKey(apiKey);
      console.log('🔄 Chave atualizada:', apiKey ? 'Sistema habilitado' : 'Sistema desabilitado');
    } catch (error) {
      console.error('❌ Erro ao atualizar chave:', error);
    } finally {
      setLoading(false);
    }
  };

  // Verificação simples: existe chave = sistema habilitado
  const hasValidGlobalKey = Boolean(globalApiKey && globalApiKey.trim().length > 0);

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
