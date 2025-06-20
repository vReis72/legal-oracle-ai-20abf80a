
import { useEffect, useCallback } from 'react';
import { UserSettingsUpdate } from '@/types/userSettings';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/providers/ThemeProvider';
import { useGlobalApiKey } from '@/hooks/globalApiKey/GlobalApiKeyContext';
import { useSettingsLoader } from './useSettingsLoader';
import { useSettingsSaver } from './useSettingsSaver';
import { SettingsValidation } from './settingsValidation';

export const useUserSettings = () => {
  const { user, profile } = useAuth();
  const { theme: currentTheme } = useTheme();
  const { globalApiKey, hasValidGlobalKey, loading: globalLoading } = useGlobalApiKey();
  
  // Use user ID from auth context when available, fallback to temp ID
  const userId = user?.id || 'temp-user-001';
  const isAuthenticated = !!user?.id;

  const {
    settings,
    isLoading,
    loadSettings,
    reloadSettings,
    resetLoader
  } = useSettingsLoader(userId);

  const { saveSettings } = useSettingsSaver(userId, isAuthenticated, reloadSettings);

  // Carrega configurações quando o userId muda
  useEffect(() => {
    console.log('🔄 useUserSettings: Iniciando carregamento para userId:', userId);
    loadSettings();
  }, [userId, loadSettings]);

  // Reset loader when user changes
  useEffect(() => {
    if (user?.id !== userId.replace('temp-user-', '')) {
      console.log('🔄 useUserSettings: Resetando loader para novo usuário:', user?.id);
      resetLoader();
    }
  }, [user?.id, resetLoader, userId]);

  // Convenience methods
  const saveApiKey = useCallback(async (key: string): Promise<boolean> => {
    return saveSettings({ openai_api_key: key });
  }, [saveSettings]);

  const removeApiKey = useCallback(async (): Promise<boolean> => {
    return saveSettings({ openai_api_key: null });
  }, [saveSettings]);

  const updateTheme = useCallback(async (theme: 'light' | 'dark' | 'system'): Promise<boolean> => {
    return saveSettings({ theme });
  }, [saveSettings]);

  const updateCompanyInfo = useCallback(async (companyName: string, contactEmail?: string): Promise<boolean> => {
    return saveSettings({ company_name: companyName, contact_email: contactEmail });
  }, [saveSettings]);

  const updateUserInfo = useCallback(async (userName: string, userOab?: string): Promise<boolean> => {
    return saveSettings({ user_name: userName, user_oab: userOab });
  }, [saveSettings]);

  // Determina a chave API a ser usada (prioridade: usuário > global)
  const getEffectiveApiKey = useCallback((): string | null => {
    // Se ainda está carregando a global, espera
    if (globalLoading) {
      return null;
    }

    const userApiKey = settings?.openai_api_key;
    console.log('🔑 useUserSettings: Determinando chave efetiva:', {
      hasUserKey: !!userApiKey,
      hasGlobalKey: !!globalApiKey,
      userKeyValid: SettingsValidation.hasValidApiKey(userApiKey),
      globalKeyValid: hasValidGlobalKey,
      globalLoading
    });
    
    // Se o usuário tem uma chave válida, use ela
    if (SettingsValidation.hasValidApiKey(userApiKey)) {
      console.log('🔑 useUserSettings: Usando chave do usuário');
      return userApiKey!;
    }
    
    // Caso contrário, use a chave global se válida
    if (hasValidGlobalKey && globalApiKey) {
      console.log('🔑 useUserSettings: Usando chave global');
      return globalApiKey;
    }
    
    console.log('🔑 useUserSettings: Nenhuma chave válida encontrada');
    return null;
  }, [settings?.openai_api_key, globalApiKey, hasValidGlobalKey, globalLoading]);

  const hasValidApiKey = useCallback((): boolean => {
    const effectiveKey = getEffectiveApiKey();
    const isValid = SettingsValidation.hasValidApiKey(effectiveKey);
    console.log('🔑 useUserSettings: Validação de chave:', {
      effectiveKey: effectiveKey ? '***' + effectiveKey.slice(-4) : null,
      isValid
    });
    return isValid;
  }, [getEffectiveApiKey]);

  const getUserName = useCallback((): string => {
    return SettingsValidation.getUserName(settings, profile);
  }, [settings, profile]);

  const getUserEmail = useCallback((): string => {
    return SettingsValidation.getUserEmail(settings, user);
  }, [settings, user]);

  const effectiveApiKey = getEffectiveApiKey();
  const isLoadingAny = isLoading || globalLoading;

  console.log('🔄 useUserSettings: Estado atual:', {
    userId,
    isAuthenticated,
    isLoading: isLoadingAny,
    hasSettings: !!settings,
    hasUserApiKey: !!settings?.openai_api_key,
    hasGlobalApiKey: !!globalApiKey,
    effectiveApiKey: effectiveApiKey ? '***' + effectiveApiKey.slice(-4) : null,
    hasValidKey: hasValidApiKey(),
    userName: getUserName(),
    userEmail: getUserEmail()
  });

  return {
    settings,
    isLoading: isLoadingAny,
    apiKey: effectiveApiKey,
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
    reloadSettings
  };
};
