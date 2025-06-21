
import { useEffect, useCallback, useMemo } from 'react';
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
  const userId = useMemo(() => user?.id || 'temp-user-001', [user?.id]);
  const isAuthenticated = !!user?.id;

  const {
    settings,
    isLoading,
    loadSettings,
    reloadSettings,
    resetLoader
  } = useSettingsLoader(userId);

  const { saveSettings } = useSettingsSaver(userId, isAuthenticated, reloadSettings);

  // Carrega configurações apenas quando necessário
  useEffect(() => {
    console.log('🎯 useUserSettings: useEffect disparado', { userId, isAuthenticated, globalLoading });
    
    // Só carrega se não está em loading global
    if (!globalLoading && userId) {
      loadSettings();
    }
  }, [userId, globalLoading, loadSettings]);

  // Reset loader when user changes from temp to real
  useEffect(() => {
    if (user?.id && userId.startsWith('temp-user-')) {
      console.log('🎯 useUserSettings: Resetando loader para usuário real');
      resetLoader();
    }
  }, [user?.id, resetLoader, userId]);

  // Convenience methods
  const updateTheme = useCallback(async (theme: 'light' | 'dark' | 'system'): Promise<boolean> => {
    return saveSettings({ theme });
  }, [saveSettings]);

  const updateCompanyInfo = useCallback(async (companyName: string, contactEmail?: string): Promise<boolean> => {
    return saveSettings({ company_name: companyName, contact_email: contactEmail });
  }, [saveSettings]);

  const updateUserInfo = useCallback(async (userName: string, userOab?: string): Promise<boolean> => {
    return saveSettings({ user_name: userName, user_oab: userOab });
  }, [saveSettings]);

  // Determina a chave API a ser usada (apenas a global agora)
  const getEffectiveApiKey = useCallback((): string | null => {
    console.log('🔑 useUserSettings: Verificando chave efetiva:', {
      globalApiKey: globalApiKey ? `${globalApiKey.substring(0, 7)}...` : 'null',
      hasValidGlobalKey,
      isValid: SettingsValidation.hasValidApiKey(globalApiKey)
    });

    // Usa apenas a chave global se válida
    if (hasValidGlobalKey && globalApiKey && SettingsValidation.hasValidApiKey(globalApiKey)) {
      console.log('✅ useUserSettings: Chave global válida encontrada');
      return globalApiKey;
    }
    
    console.log('❌ useUserSettings: Nenhuma chave válida encontrada');
    return null;
  }, [globalApiKey, hasValidGlobalKey]);

  const hasValidApiKey = useCallback((): boolean => {
    const effectiveApiKey = getEffectiveApiKey();
    const isValid = !!effectiveApiKey && SettingsValidation.hasValidApiKey(effectiveApiKey);
    console.log('🔑 useUserSettings: hasValidApiKey resultado:', isValid);
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

  console.log('🎯 useUserSettings: Estado final', {
    userId,
    isAuthenticated,
    hasSettings: !!settings,
    isLoading: isLoadingAny,
    hasValidApiKey: hasValidApiKey(),
    hasGlobalKey: hasValidGlobalKey,
    effectiveApiKey: effectiveApiKey ? `${effectiveApiKey.substring(0, 7)}...` : 'null'
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
    updateTheme,
    updateCompanyInfo,
    updateUserInfo,
    hasValidApiKey,
    reloadSettings
  };
};
