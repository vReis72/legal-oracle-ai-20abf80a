
import { supabase } from '@/integrations/supabase/client';
import { UserSettings, UserSettingsInsert, UserSettingsUpdate } from '@/types/userSettings';

export class UserSettingsService {
  
  static async getUserSettings(userId: string): Promise<UserSettings | null> {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Erro ao buscar configurações do usuário:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Erro inesperado ao buscar configurações:', error);
      return null;
    }
  }

  static async saveApiKey(userId: string, apiKey: string): Promise<boolean> {
    try {
      // Primeiro verifica se já existe configuração para este usuário
      const existing = await this.getUserSettings(userId);
      
      if (existing) {
        // Atualiza a configuração existente
        const { error } = await supabase
          .from('user_settings')
          .update({ 
            openai_api_key: apiKey,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);

        if (error) {
          console.error('Erro ao atualizar chave API:', error);
          return false;
        }
      } else {
        // Cria nova configuração
        const { error } = await supabase
          .from('user_settings')
          .insert({
            user_id: userId,
            openai_api_key: apiKey
          });

        if (error) {
          console.error('Erro ao criar configuração:', error);
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Erro inesperado ao salvar chave API:', error);
      return false;
    }
  }

  static async removeApiKey(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_settings')
        .update({ 
          openai_api_key: null,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) {
        console.error('Erro ao remover chave API:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro inesperado ao remover chave API:', error);
      return false;
    }
  }
}
