
import { useState, ReactNode, useEffect } from 'react';
import { GlobalApiKeyContext } from './GlobalApiKeyContext';
import { fetchGlobalApiKeyFromDb, saveGlobalApiKeyToDb } from './globalApiKeyService';

export const GlobalApiKeyProvider = ({ children }: { children: ReactNode }) => {
  const [globalApiKey, setGlobalApiKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Buscar a chave apenas uma vez na inicialização
  useEffect(() => {
    const loadApiKey = async () => {
      try {
        console.log('🔑 GlobalApiKeyProvider: Carregando chave...');
        const apiKey = await fetchGlobalApiKeyFromDb();
        setGlobalApiKey(apiKey);
        console.log('🔑 GlobalApiKeyProvider: Chave carregada:', apiKey ? 'SIM' : 'NÃO');
      } catch (error) {
        console.error('❌ Erro ao carregar chave API:', error);
        setGlobalApiKey(null);
      } finally {
        setLoading(false);
      }
    };

    loadApiKey();
  }, []); // Executa apenas uma vez

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
      console.error('❌ Erro ao salvar chave:', error);
      return false;
    }
  };

  const refreshGlobalApiKey = async () => {
    console.log('🔄 GlobalApiKeyProvider: Atualizando chave...');
    setLoading(true);
    try {
      const apiKey = await fetchGlobalApiKeyFromDb();
      setGlobalApiKey(apiKey);
    } catch (error) {
      console.error('❌ Erro ao atualizar chave:', error);
    } finally {
      setLoading(false);
    }
  };

  const hasValidGlobalKey = Boolean(
    globalApiKey && 
    globalApiKey.trim() !== '' && 
    globalApiKey.startsWith('sk-') && 
    globalApiKey.length > 20
  );

  console.log('🔑 GlobalApiKeyProvider: Estado atual:', {
    hasValidGlobalKey,
    loading,
    hasKey: !!globalApiKey
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
