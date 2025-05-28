
import { useState, useEffect } from 'react';
import { UserSettingsService } from '@/services/userSettingsService';
import { UserSettings, UserSettingsUpdate } from '@/types/userSettings';
import { useToast } from '@/hooks/use-toast';

// Por enquanto vamos usar um ID fixo para o usuário
// Quando implementarmos autenticação, isso virá do contexto de auth
const TEMP_USER_ID = 'temp-user-001';

export const useUserSettings = () => {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const userSettings = await UserSettingsService.getUserSettings(TEMP_USER_ID);
      setSettings(userSettings);
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

  const saveSettings = async (newSettings: Partial<UserSettingsUpdate>): Promise<boolean> => {
    try {
      const success = await UserSettingsService.saveSettings(TEMP_USER_ID, newSettings);
      if (success) {
        await loadSettings(); // Recarrega as configurações
        toast({
          title: "Sucesso",
          description: "Configurações salvas com sucesso!",
        });
        return true;
      } else {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Não foi possível salvar as configurações.",
        });
        return false;
      }
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro inesperado ao salvar as configurações.",
      });
      return false;
    }
  };

  const saveApiKey = async (key: string): Promise<boolean> => {
    return saveSettings({ openai_api_key: key });
  };

  const removeApiKey = async (): Promise<boolean> => {
    return saveSettings({ openai_api_key: null });
  };

  const updateTheme = async (theme: 'light' | 'dark' | 'system'): Promise<boolean> => {
    return saveSettings({ theme });
  };

  const updateCompanyInfo = async (companyName: string, contactEmail?: string): Promise<boolean> => {
    return saveSettings({ company_name: companyName, contact_email: contactEmail });
  };

  const updateUserInfo = async (userName: string, userOab?: string): Promise<boolean> => {
    return saveSettings({ user_name: userName, user_oab: userOab });
  };

  const hasValidApiKey = (): boolean => {
    const apiKey = settings?.openai_api_key;
    return apiKey !== null && 
           apiKey !== undefined &&
           apiKey.trim() !== '' && 
           apiKey.startsWith('sk-') && 
           apiKey !== 'sk-adicione-uma-chave-valida-aqui';
  };

  return {
    settings,
    isLoading,
    apiKey: settings?.openai_api_key || null,
    theme: settings?.theme || 'light',
    companyName: settings?.company_name || '',
    userName: settings?.user_name || '',
    userOab: settings?.user_oab || '',
    contactEmail: settings?.contact_email || '',
    saveSettings,
    saveApiKey,
    removeApiKey,
    updateTheme,
    updateCompanyInfo,
    updateUserInfo,
    hasValidApiKey,
    reloadSettings: loadSettings
  };
};
