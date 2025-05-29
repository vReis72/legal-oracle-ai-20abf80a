
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

  // Função para obter a chave API com prioridade: global (sistema) > usuário individual
  const getApiKey = (): string | null => {
    // Primeiro tenta usar a chave global do sistema (disponível para todos)
    const globalKey = getGlobalApiKey();
    if (globalKey) {
      console.log('🌐 Usando chave API global do sistema');
      return globalKey;
    }
    
    // Se não houver chave global, usa a chave individual do usuário
    const userKey = userSettings?.openai_api_key || null;
    if (userKey) {
      console.log('👤 Usando chave API individual do usuário');
      return userKey;
    }

    console.log('❌ Nenhuma chave API disponível');
    return null;
  };

  // Verifica se tem uma chave válida
  const hasValidApiKey = (): boolean => {
    const key = getApiKey();
    const isValid = !!(key && key.startsWith('sk-') && key.length > 40);
    console.log('🔍 hasValidApiKey:', isValid, key ? `chave: ${key.substring(0, 20)}...` : 'sem chave');
    return isValid;
  };

  // Salva configurações gerais do usuário
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

  // Salva chave API individual (apenas para usuários não-admin quando não há chave global)
  const saveApiKey = async (apiKey: string): Promise<boolean> => {
    if (!user) return false;

    // Se há uma chave global configurada, não permite salvar chave individual
    const globalKey = getGlobalApiKey();
    if (globalKey) {
      toast({
        variant: "info",
        title: "Chave global em uso",
        description: "O sistema está usando a chave API global. Apenas administradores podem alterá-la.",
      });
      return false;
    }

    if (profile?.is_admin) {
      toast({
        variant: "info",
        title: "Use as configurações administrativas",
        description: "Administradores devem configurar a chave API global nas configurações administrativas.",
      });
      return false;
    }

    try {
      console.log('💾 Salvando chave API individual...');
      const success = await UserSettingsService.saveApiKey(user.id, apiKey);
      if (success) {
        await loadUserSettings();
        toast({
          title: "Sucesso",
          description: "Chave API salva com sucesso!",
        });
        console.log('✅ Chave API individual salva');
      }
      return success;
    } catch (error) {
      console.error('❌ Erro ao salvar chave API:', error);
      return false;
    }
  };

  // Remove chave API individual
  const removeApiKey = async (): Promise<boolean> => {
    if (!user) return false;

    try {
      console.log('🗑️ Removendo chave API individual...');
      const success = await UserSettingsService.removeApiKey(user.id);
      if (success) {
        await loadUserSettings();
        toast({
          title: "Chave removida",
          description: "Chave API removida com sucesso!",
        });
        console.log('✅ Chave API individual removida');
      }
      return success;
    } catch (error) {
      console.error('❌ Erro ao remover chave API:', error);
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
    saveApiKey,
    removeApiKey,
    reloadSettings: loadUserSettings,
  };
};
