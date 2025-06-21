
import { createContext, useContext } from 'react';
import { UserSettings } from '@/types/userSettings';

export interface UserSettingsContextType {
  settings: UserSettings | null;
  isLoading: boolean;
  apiKey: string | null;
  theme: 'light' | 'dark' | 'system';
  companyName: string;
  userName: string;
  userOab: string;
  contactEmail: string;
  saveSettings: (settings: Partial<UserSettings>) => Promise<boolean>;
  updateTheme: (theme: 'light' | 'dark' | 'system') => Promise<boolean>;
  updateCompanyInfo: (companyName: string, contactEmail?: string) => Promise<boolean>;
  updateUserInfo: (userName: string, userOab?: string) => Promise<boolean>;
  hasValidApiKey: () => boolean;
  reloadSettings: () => Promise<void>;
}

export const UserSettingsContext = createContext<UserSettingsContextType | undefined>(undefined);

export const useUserSettingsContext = () => {
  const context = useContext(UserSettingsContext);
  if (context === undefined) {
    throw new Error('useUserSettingsContext must be used within a UserSettingsProvider');
  }
  return context;
};
