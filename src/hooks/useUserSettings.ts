
import { useState, useEffect } from 'react';
import { UserSettingsService } from '@/services/userSettingsService';
import { UserSettings } from '@/types/userSettings';
import { useToast } from '@/hooks/use-toast';

// Por enquanto vamos usar um ID fixo para o usuário
// Quando implementarmos autenticação, isso virá do contexto de auth
const TEMP_USER_ID = 'temp-user-001';

export const useUserSettings = () => {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [apiKey, setApiKeyState] = useState<string | null>(null);
  const { toast } = useToast();

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const userSettings = await UserSettingsService.getUserSettings(TEMP_USER_ID);
      setSettings(userSettings);
      setApiKeyState(userSettings?.openai_api_key || null);
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar as configurações do usuário.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const saveApiKey = async (key: string): Promise<boolean> => {
    try {
      const success = await UserSettingsService.saveApiKey(TEMP_USER_ID, key);
      if (success) {
        setApiKeyState(key);
        await loadSettings(); // Recarrega as configurações
        toast({
          title: "Sucesso",
          description: "Chave API salva com sucesso!",
        });
        return true;
      } else {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Não foi possível salvar a chave API.",
        });
        return false;
      }
    } catch (error) {
      console.error('Erro ao salvar chave API:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro inesperado ao salvar a chave API.",
      });
      return false;
    }
  };

  const removeApiKey = async (): Promise<boolean> => {
    try {
      const success = await UserSettingsService.removeApiKey(TEMP_USER_ID);
      if (success) {
        setApiKeyState(null);
        await loadSettings(); // Recarrega as configurações
        toast({
          title: "Sucesso",
          description: "Chave API removida com sucesso!",
        });
        return true;
      } else {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Não foi possível remover a chave API.",
        });
        return false;
      }
    } catch (error) {
      console.error('Erro ao remover chave API:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro inesperado ao remover a chave API.",
      });
      return false;
    }
  };

  const hasValidApiKey = (): boolean => {
    return apiKey !== null && 
           apiKey.trim() !== '' && 
           apiKey.startsWith('sk-') && 
           apiKey !== 'sk-adicione-uma-chave-valida-aqui';
  };

  return {
    settings,
    isLoading,
    apiKey,
    saveApiKey,
    removeApiKey,
    hasValidApiKey,
    reloadSettings: loadSettings
  };
};
