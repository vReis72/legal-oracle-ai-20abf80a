
import { useState, ReactNode, useEffect, useRef } from 'react';
import { GlobalApiKeyContext } from './GlobalApiKeyContext';
import { supabase } from '@/integrations/supabase/client';

export const GlobalApiKeyProvider = ({ children }: { children: ReactNode }) => {
  const [globalApiKey, setGlobalApiKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const isInitialized = useRef(false);

  const loadApiKey = async () => {
    if (isInitialized.current) {
      console.log('🔄 GlobalApiKeyProvider: Já inicializado, ignorando...');
      return;
    }

    try {
      console.log('🔍 GlobalApiKeyProvider: Carregando chave API...');
      
      const { data, error } = await supabase
        .from('system_settings')
        .select('openai_api_key')
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('❌ GlobalApiKeyProvider: Erro ao carregar chave:', error);
        setGlobalApiKey(null);
      } else {
        const apiKey = data?.openai_api_key || null;
        console.log('🔑 GlobalApiKeyProvider: Chave carregada:', {
          encontrada: !!apiKey,
          primeiros7: apiKey ? apiKey.substring(0, 7) : 'N/A',
          tamanho: apiKey?.length || 0
        });
        setGlobalApiKey(apiKey);
      }
    } catch (error) {
      console.error('💥 GlobalApiKeyProvider: Erro inesperado:', error);
      setGlobalApiKey(null);
    } finally {
      setLoading(false);
      isInitialized.current = true;
    }
  };

  useEffect(() => {
    loadApiKey();
  }, []);

  const saveGlobalApiKey = async (key: string): Promise<boolean> => {
    try {
      console.log('💾 GlobalApiKeyProvider: Salvando chave API...');
      
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
        console.error('❌ GlobalApiKeyProvider: Erro ao salvar:', result.error);
        return false;
      }

      setGlobalApiKey(key);
      console.log('✅ GlobalApiKeyProvider: Chave salva com sucesso');
      return true;
    } catch (error) {
      console.error('💥 GlobalApiKeyProvider: Erro ao salvar:', error);
      return false;
    }
  };

  const refreshGlobalApiKey = async () => {
    console.log('🔄 GlobalApiKeyProvider: Forçando atualização...');
    setLoading(true);
    isInitialized.current = false;
    await loadApiKey();
  };

  // Validação simples e robusta
  const hasValidGlobalKey = !!(
    globalApiKey && 
    globalApiKey.trim().length > 0 && 
    globalApiKey.startsWith('sk-') && 
    globalApiKey.length >= 40
  );

  console.log('🔑 GlobalApiKeyProvider: Estado atual:', {
    loading,
    hasKey: !!globalApiKey,
    isValid: hasValidGlobalKey,
    keyPreview: globalApiKey ? `${globalApiKey.substring(0, 7)}...` : 'null'
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
