
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
    loadSettings();
  }, [userId, loadSettings]);

  // Reset loader when user changes
  useEffect(() => {
    if (user?.id && userId.startsWith('temp-user-')) {
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
    // Usa apenas a chave global se válida
    if (hasValidGlobalKey && globalApiKey && SettingsValidation.hasValidApiKey(globalApiKey)) {
      return globalApiKey;
    }
    
    return null;
  }, [globalApiKey, hasValidGlobalKey]);

  const hasValidApiKey = useCallback((): boolean => {
    const effectiveApiKey = getEffectiveApiKey();
    return !!effectiveApiKey && SettingsValidation.hasValidApiKey(effectiveApiKey);
  }, [getEffectiveApiKey]);

  const getUserName = useCallback((): string => {
    return SettingsValidation.getUserName(settings, profile);
  }, [settings, profile]);

  const getUserEmail = useCallback((): string => {
    return SettingsValidation.getUserEmail(settings, user);
  }, [settings, user]);

  const effectiveApiKey = getEffectiveApiKey();
  const isLoadingAny = isLoading || globalLoading;

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
