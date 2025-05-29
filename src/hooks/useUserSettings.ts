
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { UserSettingsService } from '@/services/userSettingsService';
import { useSystemSettings } from '@/hooks/useSystemSettings';
import { useToast } from '@/hooks/use-toast';
import { UserSettings, UserSettingsUpdate } from '@/types/userSettings';

export const useUserSettings = () => {
  const { user, profile } = useAuth();
  const { getApiKey: getGlobalApiKey } = useSystemSettings();
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
      const settings = await UserSettingsService.getUserSettings(user.id);
      setUserSettings(settings);
    } catch (error) {
      console.error('Erro ao carregar configurações do usuário:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUserSettings();
  }, [user]);

  // Função para obter a chave API com prioridade: global (admin) > usuário individual
  const getApiKey = (): string | null => {
    // Se é admin, usa a chave global
    if (profile?.is_admin) {
      const globalKey = getGlobalApiKey();
      if (globalKey) return globalKey;
    }
    
    // Senão, usa a chave individual do usuário
    return userSettings?.openai_api_key || null;
  };

  // Verifica se tem uma chave válida
  const hasValidApiKey = (): boolean => {
    const key = getApiKey();
    return !!(key && key.startsWith('sk-') && key.length > 40);
  };

  // Salva configurações gerais do usuário
  const saveSettings = async (settings: UserSettingsUpdate): Promise<boolean> => {
    if (!user) return false;

    try {
      const success = await UserSettingsService.saveSettings(user.id, settings);
      if (success) {
        await loadUserSettings();
        toast({
          title: "Sucesso",
          description: "Configurações salvas com sucesso!",
        });
      }
      return success;
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível salvar as configurações.",
      });
      return false;
    }
  };

  // Salva chave API individual (apenas para usuários não-admin)
  const saveApiKey = async (apiKey: string): Promise<boolean> => {
    if (!user) return false;

    if (profile?.is_admin) {
      toast({
        variant: "info",
        title: "Uso da chave global",
        description: "Administradores usam a chave API global configurada nas configurações do sistema.",
      });
      return false;
    }

    try {
      const success = await UserSettingsService.saveApiKey(user.id, apiKey);
      if (success) {
        await loadUserSettings();
        toast({
          title: "Sucesso",
          description: "Chave API salva com sucesso!",
        });
      }
      return success;
    } catch (error) {
      console.error('Erro ao salvar chave API:', error);
      return false;
    }
  };

  // Remove chave API individual
  const removeApiKey = async (): Promise<boolean> => {
    if (!user) return false;

    try {
      const success = await UserSettingsService.removeApiKey(user.id);
      if (success) {
        await loadUserSettings();
        toast({
          title: "Chave removida",
          description: "Chave API removida com sucesso!",
        });
      }
      return success;
    } catch (error) {
      console.error('Erro ao remover chave API:', error);
      return false;
    }
  };

  return {
    userSettings,
    settings: userSettings, // Alias for backward compatibility
    isLoading,
    apiKey: getApiKey(),
    hasValidApiKey: hasValidApiKey(),
    saveSettings,
    saveApiKey,
    removeApiKey,
    reloadSettings: loadUserSettings,
  };
};
