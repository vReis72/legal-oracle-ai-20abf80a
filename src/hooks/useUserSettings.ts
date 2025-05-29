
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { UserSettingsService } from '@/services/userSettingsService';
import { useApiKey } from '@/hooks/useApiKey';
import { useToast } from '@/hooks/use-toast';
import { UserSettings, UserSettingsUpdate } from '@/types/userSettings';

export const useUserSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const { apiKey, hasValidKey } = useApiKey();

  const loadUserSettings = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      console.log('👤 Carregando configurações do usuário...');
      const settings = await UserSettingsService.getUserSettings(user.id);
      setUserSettings(settings);
      console.log('✅ Configurações do usuário carregadas');
    } catch (error) {
      console.error('❌ Erro ao carregar configurações do usuário:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUserSettings();
  }, [user]);

  const saveSettings = async (settings: UserSettingsUpdate): Promise<boolean> => {
    if (!user) return false;

    try {
      console.log('💾 Salvando configurações do usuário...');
      const success = await UserSettingsService.saveSettings(user.id, settings);
      if (success) {
        await loadUserSettings();
        toast({
          title: "Sucesso",
          description: "Configurações salvas com sucesso!",
        });
        console.log('✅ Configurações do usuário salvas');
      }
      return success;
    } catch (error) {
      console.error('❌ Erro ao salvar configurações:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível salvar as configurações.",
      });
      return false;
    }
  };

  return {
    userSettings,
    settings: userSettings,
    isLoading,
    apiKey,
    hasValidApiKey: hasValidKey,
    saveSettings,
    reloadSettings: loadUserSettings,
  };
};
