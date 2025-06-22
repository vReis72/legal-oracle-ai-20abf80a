
import { useState, ReactNode, useEffect, useRef } from 'react';
import { GlobalApiKeyContext } from './GlobalApiKeyContext';
import { supabase } from '@/integrations/supabase/client';

export const GlobalApiKeyProvider = ({ children }: { children: ReactNode }) => {
  const [globalApiKey, setGlobalApiKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const isCheckingRef = useRef(false);

  const checkApiKey = async () => {
    // Prevenir múltiplas chamadas simultâneas
    if (isCheckingRef.current) {
      console.log('🔄 CheckApiKey já em execução, ignorando...');
      return;
    }

    isCheckingRef.current = true;

    try {
      console.log('🔍 Verificando chave API na system_settings...');
      
      const { data, error } = await supabase
        .from('system_settings')
        .select('openai_api_key')
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('❌ Erro ao verificar chave:', error);
        setGlobalApiKey(null);
      } else {
        const apiKey = data?.openai_api_key || null;
        setGlobalApiKey(apiKey);
        console.log('🔑 Resultado da verificação:', {
          temChave: !!apiKey,
          tamanho: apiKey?.length || 0,
          primeiros: apiKey?.substring(0, 10) || 'N/A'
        });
      }
    } catch (error) {
      console.error('💥 Erro inesperado:', error);
      setGlobalApiKey(null);
    } finally {
      setLoading(false);
      isCheckingRef.current = false;
    }
  };

  useEffect(() => {
    checkApiKey();
  }, []);

  const saveGlobalApiKey = async (key: string): Promise<boolean> => {
    try {
      console.log('💾 Salvando chave API...');
      
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
        console.error('❌ Erro ao salvar:', result.error);
        return false;
      }

      setGlobalApiKey(key);
      console.log('✅ Chave salva com sucesso');
      return true;
    } catch (error) {
      console.error('💥 Erro ao salvar:', error);
      return false;
    }
  };

  const refreshGlobalApiKey = async () => {
    if (isCheckingRef.current) {
      console.log('🔄 Refresh já em execução, ignorando...');
      return;
    }

    setLoading(true);
    await checkApiKey();
  };

  // Validação mais robusta da chave
  const hasValidGlobalKey = !!(globalApiKey && 
    globalApiKey.trim().length > 0 && 
    globalApiKey.startsWith('sk-') && 
    globalApiKey.length >= 40 &&
    !globalApiKey.includes('placeholder') &&
    !globalApiKey.includes('example'));

  console.log('🔑 Estado atual GlobalApiKeyProvider:', {
    loading,
    hasValidGlobalKey,
    keyLength: globalApiKey?.length || 0,
    keyStart: globalApiKey?.substring(0, 7) || 'N/A',
    isChecking: isCheckingRef.current
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
