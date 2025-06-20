
import { useState, ReactNode, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { GlobalApiKeyContext } from './GlobalApiKeyContext';
import { checkSupabaseConnection, fetchGlobalApiKeyFromDb, saveGlobalApiKeyToDb } from './globalApiKeyService';

export const GlobalApiKeyProvider = ({ children }: { children: ReactNode }) => {
  const [globalApiKey, setGlobalApiKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading) return;

    const fetchApiKey = async () => {
      try {
        console.log('🔑 Buscando chave API global...');
        const isConnected = await checkSupabaseConnection();
        if (isConnected) {
          const apiKey = await fetchGlobalApiKeyFromDb();
          setGlobalApiKey(apiKey);
        }
      } catch (error) {
        console.error('Erro ao buscar chave API:', error);
        setGlobalApiKey(null);
      } finally {
        setLoading(false);
      }
    };

    fetchApiKey();
  }, [authLoading]);

  const saveGlobalApiKey = async (key: string): Promise<boolean> => {
    try {
      if (!user) return false;
      const success = await saveGlobalApiKeyToDb(key, user.id);
      if (success) {
        setGlobalApiKey(key);
        toast({
          title: "Sucesso",
          description: "Chave API OpenAI salva com sucesso!",
        });
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
