
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { UserSettingsService } from '@/services/userSettingsService';
import { useSystemSettings } from '@/hooks/useSystemSettings';
import { useToast } from '@/hooks/use-toast';
import { UserSettings, UserSettingsUpdate } from '@/types/userSettings';

export const useUserSettings = () => {
  const { user, profile } = useAuth();
  const { getApiKey: getGlobalApiKey, isLoading: isLoadingSystem } = useSystemSettings();
  const { toast } = useToast();
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Carrega configurações do usuário
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

  // Função para obter a chave API - SEMPRE a chave global do sistema
  const getApiKey = (): string | null => {
    const globalKey = getGlobalApiKey();
    if (globalKey) {
      console.log('🌐 Usando chave API global do sistema');
      return globalKey;
    }

    console.log('❌ Nenhuma chave API configurada pelo administrador');
    return null;
  };

  // Verifica se tem uma chave válida
  const hasValidApiKey = (): boolean => {
    const key = getApiKey();
    const isValid = !!(key && key.startsWith('sk-') && key.length > 40);
    console.log('🔍 hasValidApiKey:', isValid, key ? `chave: ${key.substring(0, 20)}...` : 'sem chave');
    return isValid;
  };

  // Salva configurações gerais do usuário (sem API key)
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

  const currentApiKey = getApiKey();
  const isValidKey = hasValidApiKey();

  return {
    userSettings,
    settings: userSettings, // Alias for backward compatibility
    isLoading: isLoading || isLoadingSystem,
    apiKey: currentApiKey,
    hasValidApiKey: isValidKey,
    saveSettings,
    reloadSettings: loadUserSettings,
  };
};
