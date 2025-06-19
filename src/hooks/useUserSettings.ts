
import { useState, useEffect } from 'react';
import { UserSettingsService } from '@/services/userSettingsService';
import { LocalUserSettingsService } from '@/services/localUserSettingsService';
import { UserSettings, UserSettingsUpdate } from '@/types/userSettings';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/providers/ThemeProvider';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export const useUserSettings = () => {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { setTheme, theme: currentTheme } = useTheme();
  const { user, profile } = useAuth();

  // Use user ID from auth context when available, fallback to temp ID
  const userId = user?.id || 'temp-user-001';

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      // Tenta carregar do Supabase primeiro
      let userSettings = await UserSettingsService.getUserSettings(userId);
      
      // Se não conseguir do Supabase, tenta do localStorage
      if (!userSettings) {
        userSettings = LocalUserSettingsService.getUserSettings(userId);
      }
      
      setSettings(userSettings);

      // Aplica o tema salvo apenas se for diferente do atual
      if (userSettings?.theme && userSettings.theme !== currentTheme) {
        console.log('Aplicando tema salvo:', userSettings.theme);
        setTheme(userSettings.theme);
      }
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
  }, [userId]);

  // Função para sincronizar dados com a tabela profiles
  const syncWithProfile = async (settingsData: Partial<UserSettingsUpdate>): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      const profileUpdates: any = {};
      
      // Mapeia os campos de user_settings para profiles
      if (settingsData.user_name !== undefined) {
        profileUpdates.full_name = settingsData.user_name;
      }
      
      if (settingsData.contact_email !== undefined) {
        profileUpdates.email = settingsData.contact_email;
      }
      
      if (settingsData.company_name !== undefined) {
        profileUpdates.company_name = settingsData.company_name;
      }
      
      if (settingsData.user_oab !== undefined) {
        profileUpdates.oab_number = settingsData.user_oab;
      }

      // Se há atualizações para fazer no perfil
      if (Object.keys(profileUpdates).length > 0) {
        const { error } = await supabase
          .from('profiles')
          .update({
            ...profileUpdates,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);

        if (error) {
          console.error('Erro ao sincronizar com perfil:', error);
          return false;
        }
        
        console.log('Perfil sincronizado com sucesso:', profileUpdates);
      }
      
      return true;
    } catch (error) {
      console.error('Erro inesperado ao sincronizar perfil:', error);
      return false;
    }
  };

  const saveSettings = async (newSettings: Partial<UserSettingsUpdate>): Promise<boolean> => {
    try {
      // Se estamos salvando um tema, aplica imediatamente
      if (newSettings.theme && newSettings.theme !== currentTheme) {
        console.log('Salvando e aplicando novo tema:', newSettings.theme);
        setTheme(newSettings.theme);
      }

      // Tenta salvar no Supabase primeiro
      let success = await UserSettingsService.saveSettings(userId, newSettings);
      
      // Se falhar no Supabase, salva no localStorage
      if (!success) {
        success = LocalUserSettingsService.saveSettings(userId, newSettings);
        if (success) {
          toast({
            title: "Configurações Salvas (Local)",
            description: "Suas configurações foram salvas localmente. Para sincronizar com o banco, execute a migration do Supabase.",
          });
        }
      } else {
        // Se salvou com sucesso no Supabase, sincroniza com a tabela profiles
        const profileSyncSuccess = await syncWithProfile(newSettings);
        
        if (profileSyncSuccess) {
          toast({
            title: "Sucesso",
            description: "Configurações salvas e sincronizadas com sucesso!",
          });
        } else {
          toast({
            title: "Parcialmente Salvo",
            description: "Configurações salvas, mas houve um problema na sincronização do perfil.",
          });
        }
      }
      
      if (success) {
        await loadSettings(); // Recarrega as configurações
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

  // Get user data from auth profile or settings, with fallbacks
  const getUserName = (): string => {
    return settings?.user_name || profile?.full_name || '';
  };

  const getUserEmail = (): string => {
    return settings?.contact_email || user?.email || '';
  };

  return {
    settings,
    isLoading,
    apiKey: settings?.openai_api_key || null,
    theme: settings?.theme || currentTheme,
    companyName: settings?.company_name || '',
    userName: getUserName(),
    userOab: settings?.user_oab || '',
    contactEmail: getUserEmail(),
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
