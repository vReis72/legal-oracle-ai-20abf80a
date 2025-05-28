
import { UserSettings, UserSettingsUpdate } from '@/types/userSettings';

const SETTINGS_KEY = 'user_settings';

export class LocalUserSettingsService {
  static getUserSettings(userId: string): UserSettings | null {
    try {
      const stored = localStorage.getItem(`${SETTINGS_KEY}_${userId}`);
      if (stored) {
        return JSON.parse(stored);
      }
      return null;
    } catch (error) {
      console.error('Erro ao carregar configurações do localStorage:', error);
      return null;
    }
  }

  static saveSettings(userId: string, settings: Partial<UserSettingsUpdate>): boolean {
    try {
      const existing = this.getUserSettings(userId);
      const updated = {
        ...existing,
        ...settings,
        user_id: userId,
        id: existing?.id || `local_${userId}`,
        created_at: existing?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      localStorage.setItem(`${SETTINGS_KEY}_${userId}`, JSON.stringify(updated));
      return true;
    } catch (error) {
      console.error('Erro ao salvar configurações no localStorage:', error);
      return false;
    }
  }

  static removeSettings(userId: string): boolean {
    try {
      localStorage.removeItem(`${SETTINGS_KEY}_${userId}`);
      return true;
    } catch (error) {
      console.error('Erro ao remover configurações do localStorage:', error);
      return false;
    }
  }
}
