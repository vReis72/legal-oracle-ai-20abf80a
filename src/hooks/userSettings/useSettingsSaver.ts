
import { useCallback } from 'react';
import { UserSettingsUpdate } from '@/types/userSettings';
import { UserSettingsService } from '@/services/userSettingsService';
import { LocalUserSettingsService } from '@/services/localUserSettingsService';
import { ProfileSyncService } from './profileSyncService';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/providers/ThemeProvider';

export const useSettingsSaver = (
  userId: string, 
  isAuthenticated: boolean,
  reloadSettings: () => Promise<void>
) => {
  const { toast } = useToast();
  const { setTheme, theme: currentTheme } = useTheme();

  const saveSettings = useCallback(async (newSettings: Partial<UserSettingsUpdate>): Promise<boolean> => {
    try {
      // Se estamos salvando um tema, aplica imediatamente
      if (newSettings.theme && newSettings.theme !== currentTheme) {
        console.log('Salvando e aplicando novo tema:', newSettings.theme);
        setTheme(newSettings.theme);
      }

      let success = false;

      // Se o usuário está autenticado, salva no Supabase
      if (isAuthenticated) {
        success = await UserSettingsService.saveSettings(userId, newSettings);
        
        if (success) {
          // Sincroniza com a tabela profiles
          const profileSyncSuccess = await ProfileSyncService.syncWithProfile(userId, newSettings);
          
          if (profileSyncSuccess) {
            toast({
              title: "Sucesso",
              description: "Configurações salvas e sincronizadas com sucesso!",
            });
          } else {
            toast({
              title: "Parcialmente Salvo",
              description: "Configurações salvas, mas houve um problema na sincronização do perfil.",
            });
          }
        }
      } else {
        // Se não está autenticado, salva no localStorage
        success = LocalUserSettingsService.saveSettings(userId, newSettings);
        if (success) {
          toast({
            title: "Configurações Salvas (Local)",
            description: "Suas configurações foram salvas localmente. Faça login para sincronizar com o banco.",
          });
        }
      }
      
      if (success) {
        // Recarrega as configurações
        await reloadSettings();
        return true;
      } else {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Não foi possível salvar as configurações.",
        });
        return false;
      }
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro inesperado ao salvar as configurações.",
      });
      return false;
    }
  }, [userId, isAuthenticated, currentTheme, setTheme, toast, reloadSettings]);

  return { saveSettings };
};
