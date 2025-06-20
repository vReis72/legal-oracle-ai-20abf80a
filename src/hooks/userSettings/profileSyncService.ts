
import { supabase } from '@/integrations/supabase/client';
import { UserSettingsUpdate } from '@/types/userSettings';

export class ProfileSyncService {
  static async syncWithProfile(
    userId: string,
    settingsData: Partial<UserSettingsUpdate>
  ): Promise<boolean> {
    try {
      const profileUpdates: any = {};
      
      // Mapeia os campos de user_settings para profiles
      if (settingsData.user_name !== undefined) {
        profileUpdates.full_name = settingsData.user_name;
      }
      
      if (settingsData.contact_email !== undefined) {
        profileUpdates.email = settingsData.contact_email;
      }
      
      if (settingsData.company_name !== undefined) {
        profileUpdates.company_name = settingsData.company_name;
      }
      
      if (settingsData.user_oab !== undefined) {
        profileUpdates.oab_number = settingsData.user_oab;
      }

      // Se há atualizações para fazer no perfil
      if (Object.keys(profileUpdates).length > 0) {
        const { error } = await supabase
          .from('profiles')
          .update({
            ...profileUpdates,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId);

        if (error) {
          console.error('Erro ao sincronizar com perfil:', error);
          return false;
        }
        
        console.log('Perfil sincronizado com sucesso:', profileUpdates);
      }
      
      return true;
    } catch (error) {
      console.error('Erro inesperado ao sincronizar perfil:', error);
      return false;
    }
  }
}
