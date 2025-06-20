
import { useState, ReactNode, useEffect } from 'react';
import { GlobalApiKeyContext } from './GlobalApiKeyContext';
import { fetchGlobalApiKeyFromDb, saveGlobalApiKeyToDb } from './globalApiKeyService';
import { SettingsValidation } from '@/hooks/userSettings/settingsValidation';

export const GlobalApiKeyProvider = ({ children }: { children: ReactNode }) => {
  const [globalApiKey, setGlobalApiKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);

  // Buscar a chave apenas uma vez na inicialização
  useEffect(() => {
    if (hasLoaded) return;

    const loadApiKey = async () => {
      try {
        console.log('🔑 GlobalApiKeyProvider: Carregando chave...');
        const apiKey = await fetchGlobalApiKeyFromDb();
        setGlobalApiKey(apiKey);
        console.log('🔑 GlobalApiKeyProvider: Chave carregada:', apiKey ? 'SIM (***' + apiKey.slice(-4) + ')' : 'NÃO');
      } catch (error) {
        console.error('❌ GlobalApiKeyProvider: Erro ao carregar chave API:', error);
        setGlobalApiKey(null);
      } finally {
        setLoading(false);
        setHasLoaded(true);
      }
    };

    loadApiKey();
  }, [hasLoaded]);

  const saveGlobalApiKey = async (key: string): Promise<boolean> => {
    try {
      console.log('💾 GlobalApiKeyProvider: Salvando chave...');
      const success = await saveGlobalApiKeyToDb(key, 'system');
      if (success) {
        setGlobalApiKey(key);
        console.log('✅ GlobalApiKeyProvider: Chave salva com sucesso');
      }
      return success;
    } catch (error) {
      console.error('❌ GlobalApiKeyProvider: Erro ao salvar chave:', error);
      return false;
    }
  };

  const refreshGlobalApiKey = async () => {
    console.log('🔄 GlobalApiKeyProvider: Atualizando chave...');
    setLoading(true);
    try {
      const apiKey = await fetchGlobalApiKeyFromDb();
      setGlobalApiKey(apiKey);
      console.log('🔄 GlobalApiKeyProvider: Chave atualizada:', apiKey ? 'SIM' : 'NÃO');
    } catch (error) {
      console.error('❌ GlobalApiKeyProvider: Erro ao atualizar chave:', error);
    } finally {
      setLoading(false);
    }
  };

  // Usar a validação centralizada
  const hasValidGlobalKey = Boolean(
    globalApiKey && SettingsValidation.hasValidApiKey(globalApiKey)
  );

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
