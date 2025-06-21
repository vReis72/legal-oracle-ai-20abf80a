import { supabase } from '@/integrations/supabase/client';
import { UserSettings, UserSettingsInsert, UserSettingsUpdate } from '@/types/userSettings';

export class UserSettingsService {
  
  static async getUserSettings(userId: string): Promise<UserSettings | null> {
    try {
      console.log('🔍 UserSettingsService: Buscando configurações para usuário:', userId);
      
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code !== 'PGRST116') { // PGRST116 = no rows returned
          console.error('❌ UserSettingsService: Erro ao buscar configurações:', error);
        } else {
          console.log('ℹ️ UserSettingsService: Nenhuma configuração encontrada para usuário:', userId);
        }
        return null;
      }

      console.log('✅ UserSettingsService: Configurações encontradas:', data);
      return data as UserSettings;
    } catch (error) {
      console.error('❌ UserSettingsService: Erro inesperado ao buscar configurações:', error);
      return null;
    }
  }

  static async saveSettings(userId: string, settings: Partial<UserSettingsUpdate>): Promise<boolean> {
    try {
      console.log('💾 UserSettingsService: Salvando configurações para usuário:', userId, settings);
      
      // Primeiro verifica se já existe configuração para este usuário
      const existing = await this.getUserSettings(userId);
      
      if (existing) {
        // Atualiza a configuração existente
        const { error } = await supabase
          .from('user_settings')
          .update({ 
            ...settings,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);

        if (error) {
          console.error('❌ UserSettingsService: Erro ao atualizar configurações:', error);
          return false;
        }
        
        console.log('✅ UserSettingsService: Configurações atualizadas com sucesso');
      } else {
        // Cria nova configuração
        const { error } = await supabase
          .from('user_settings')
          .insert({
            user_id: userId,
            ...settings
          });

        if (error) {
          console.error('❌ UserSettingsService: Erro ao criar configuração:', error);
          return false;
        }
        
        console.log('✅ UserSettingsService: Nova configuração criada com sucesso');
      }

      return true;
    } catch (error) {
      console.error('❌ UserSettingsService: Erro inesperado ao salvar configurações:', error);
      return false;
    }
  }

  static async createDefaultSettings(userId: string, profileData?: any): Promise<boolean> {
    try {
      console.log('🆕 Criando configurações padrão para usuário:', userId);
      
      const defaultSettings = {
        user_id: userId,
        user_name: profileData?.full_name || '',
        contact_email: profileData?.email || '',
        company_name: profileData?.company_name || '',
        user_oab: profileData?.oab_number || '',
        theme: 'light' as const
      };

      const { error } = await supabase
        .from('user_settings')
        .insert(defaultSettings);

      if (error) {
        console.error('Erro ao criar configurações padrão:', error);
        return false;
      }

      console.log('✅ Configurações padrão criadas com sucesso');
      return true;
    } catch (error) {
      console.error('Erro inesperado ao criar configurações padrão:', error);
      return false;
    }
  }

  static async updateTheme(userId: string, theme: 'light' | 'dark' | 'system'): Promise<boolean> {
    return this.saveSettings(userId, { theme });
  }

  static async updateCompanyInfo(userId: string, companyName: string, contactEmail?: string): Promise<boolean> {
    return this.saveSettings(userId, { company_name: companyName, contact_email: contactEmail });
  }

  static async updateUserInfo(userId: string, userName: string, userOab?: string): Promise<boolean> {
    return this.saveSettings(userId, { user_name: userName, user_oab: userOab });
  }
}
