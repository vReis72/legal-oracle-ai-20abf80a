
import { useEffect, useCallback, useMemo, useRef } from 'react';
import { UserSettingsUpdate } from '@/types/userSettings';
import { useTheme } from '@/providers/ThemeProvider';
import { useGlobalApiKey } from '@/hooks/globalApiKey/GlobalApiKeyContext';
import { useSettingsLoader } from './useSettingsLoader';
import { useSettingsSaver } from './useSettingsSaver';
import { SettingsValidation } from './settingsValidation';

export const useUserSettings = () => {
  const { theme: currentTheme } = useTheme();
  const { globalApiKey, hasValidGlobalKey } = useGlobalApiKey();
  const hasInitializedRef = useRef(false);
  
  // Use temp user ID since no authentication
  const userId = 'temp-user-001';
  const isAuthenticated = false;

  const {
    settings,
    isLoading: settingsLoading,
    loadSettings,
    reloadSettings,
    resetLoader
  } = useSettingsLoader(userId);

  const { saveSettings } = useSettingsSaver(userId, isAuthenticated, reloadSettings);

  // Load settings only once
  useEffect(() => {
    if (!hasInitializedRef.current && !settingsLoading) {
      console.log('🎯 useUserSettings: Inicializando uma única vez');
      hasInitializedRef.current = true;
      loadSettings();
    }
  }, [loadSettings, settingsLoading]);

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

  // Determine effective API key
  const getEffectiveApiKey = useCallback((): string | null => {
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
    return SettingsValidation.getUserName(settings, null);
  }, [settings]);

  const getUserEmail = useCallback((): string => {
    return SettingsValidation.getUserEmail(settings, null);
  }, [settings]);

  const effectiveApiKey = getEffectiveApiKey();

  return {
    settings,
    isLoading: settingsLoading,
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
