
import { useEffect, useCallback } from 'react';
import { UserSettingsUpdate } from '@/types/userSettings';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/providers/ThemeProvider';
import { useSettingsLoader } from './useSettingsLoader';
import { useSettingsSaver } from './useSettingsSaver';
import { SettingsValidation } from './settingsValidation';

export const useUserSettings = () => {
  const { user, profile } = useAuth();
  const { theme: currentTheme } = useTheme();
  
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

  useEffect(() => {
    loadSettings();
  }, [userId, loadSettings]);

  useEffect(() => {
    if (user?.id && userId.startsWith('temp-user-')) {
      resetLoader();
    }
  }, [user?.id, resetLoader, userId]);

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

  const hasValidApiKey = useCallback((): boolean => {
    const userApiKey = settings?.openai_api_key;
    return !!userApiKey && SettingsValidation.hasValidApiKey(userApiKey);
  }, [settings?.openai_api_key]);

  const getUserName = useCallback((): string => {
    return SettingsValidation.getUserName(settings, profile);
  }, [settings, profile]);

  const getUserEmail = useCallback((): string => {
    return SettingsValidation.getUserEmail(settings, user);
  }, [settings, user]);

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
    reloadSettings
  };
};
