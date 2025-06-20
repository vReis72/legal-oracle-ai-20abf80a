
import { useEffect } from 'react';
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
  const { globalApiKey, hasValidGlobalKey } = useGlobalApiKey();
  
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

  useEffect(() => {
    console.log('🔄 useUserSettings: Iniciando carregamento para userId:', userId);
    loadSettings();
  }, [userId, loadSettings]);

  // Reset loader when user changes
  useEffect(() => {
    console.log('🔄 useUserSettings: Resetando loader para novo usuário:', user?.id);
    resetLoader();
  }, [user?.id, resetLoader]);

  // Convenience methods
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

  // Determina a chave API a ser usada (prioridade: usuário > global)
  const getEffectiveApiKey = (): string | null => {
    const userApiKey = settings?.openai_api_key;
    console.log('🔑 useUserSettings: Determinando chave efetiva:', {
      hasUserKey: !!userApiKey,
      hasGlobalKey: !!globalApiKey,
      userKeyValid: SettingsValidation.hasValidApiKey(userApiKey),
      globalKeyValid: hasValidGlobalKey
    });
    
    // Se o usuário tem uma chave válida, use ela
    if (SettingsValidation.hasValidApiKey(userApiKey)) {
      return userApiKey!;
    }
    
    // Caso contrário, use a chave global se válida
    if (hasValidGlobalKey && globalApiKey) {
      return globalApiKey;
    }
    
    return null;
  };

  const hasValidApiKey = (): boolean => {
    const effectiveKey = getEffectiveApiKey();
    const isValid = SettingsValidation.hasValidApiKey(effectiveKey);
    console.log('🔑 useUserSettings: Validação de chave:', {
      effectiveKey: effectiveKey ? '***' + effectiveKey.slice(-4) : null,
      isValid
    });
    return isValid;
  };

  const getUserName = (): string => {
    return SettingsValidation.getUserName(settings, profile);
  };

  const getUserEmail = (): string => {
    return SettingsValidation.getUserEmail(settings, user);
  };

  const effectiveApiKey = getEffectiveApiKey();

  console.log('🔄 useUserSettings: Estado atual:', {
    userId,
    isAuthenticated,
    isLoading,
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
    isLoading,
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
