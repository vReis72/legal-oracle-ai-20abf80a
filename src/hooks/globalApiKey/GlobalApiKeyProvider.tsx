
import { useState, ReactNode, useEffect } from 'react';
import { GlobalApiKeyContext } from './GlobalApiKeyContext';
import { fetchGlobalApiKeyFromDb, saveGlobalApiKeyToDb } from './globalApiKeyService';

export const GlobalApiKeyProvider = ({ children }: { children: ReactNode }) => {
  const [globalApiKey, setGlobalApiKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Buscar a chave apenas uma vez na inicialização
  useEffect(() => {
    let mounted = true;
    
    const loadApiKey = async () => {
      try {
        const apiKey = await fetchGlobalApiKeyFromDb();
        if (mounted) {
          setGlobalApiKey(apiKey);
          setLoading(false);
        }
      } catch (error) {
        console.error('Erro ao carregar chave API:', error);
        if (mounted) {
          setGlobalApiKey(null);
          setLoading(false);
        }
      }
    };

    loadApiKey();

    return () => {
      mounted = false;
    };
  }, []); // Array vazio - executa apenas uma vez

  const saveGlobalApiKey = async (key: string): Promise<boolean> => {
    try {
      // Para este exemplo, vamos assumir que sempre temos um user ID válido
      const success = await saveGlobalApiKeyToDb(key, 'system');
      if (success) {
        setGlobalApiKey(key);
      }
      return success;
    } catch (error) {
      console.error('Erro ao salvar chave:', error);
      return false;
    }
  };

  const refreshGlobalApiKey = async () => {
    setLoading(true);
    try {
      const apiKey = await fetchGlobalApiKeyFromDb();
      setGlobalApiKey(apiKey);
    } catch (error) {
      console.error('Erro ao atualizar chave:', error);
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
