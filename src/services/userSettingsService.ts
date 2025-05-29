
import { supabase } from '@/integrations/supabase/client';
import { UserSettings, UserSettingsInsert, UserSettingsUpdate } from '@/types/userSettings';

export class UserSettingsService {
  
  static async getUserSettings(userId: string): Promise<UserSettings | null> {
    try {
      const { data, error } = await (supabase as any)
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        // Se a tabela não existir (código 42P01), retorna null silenciosamente
        if (error.code === '42P01') {
          console.log('Tabela user_settings não existe no Supabase, usando localStorage');
          return null;
        }
        
        // Para outros erros, apenas loga
        if (error.code !== 'PGRST116') { // PGRST116 = no rows returned
          console.error('Erro ao buscar configurações do usuário:', error);
        }
        return null;
      }

      return data as UserSettings;
    } catch (error) {
      console.error('Erro inesperado ao buscar configurações:', error);
      return null;
    }
  }

  static async saveSettings(userId: string, settings: Partial<UserSettingsUpdate>): Promise<boolean> {
    try {
      // Primeiro verifica se já existe configuração para este usuário
      const existing = await this.getUserSettings(userId);
      
      if (existing) {
        // Atualiza a configuração existente
        const { error } = await (supabase as any)
          .from('user_settings')
          .update({ 
            ...settings,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);

        if (error) {
          // Se a tabela não existir, falha silenciosamente
          if (error.code === '42P01') {
            console.log('Tabela user_settings não existe, salvando apenas no localStorage');
            return false;
          }
          console.error('Erro ao atualizar configurações:', error);
          return false;
        }
      } else {
        // Cria nova configuração
        const { error } = await (supabase as any)
          .from('user_settings')
          .insert({
            user_id: userId,
            ...settings
          });

        if (error) {
          // Se a tabela não existir, falha silenciosamente
          if (error.code === '42P01') {
            console.log('Tabela user_settings não existe, salvando apenas no localStorage');
            return false;
          }
          console.error('Erro ao criar configuração:', error);
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Erro inesperado ao salvar configurações:', error);
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
