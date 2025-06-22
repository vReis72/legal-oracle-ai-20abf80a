
import { useCallback } from 'react';
import { UserSettingsUpdate } from '@/types/userSettings';
import { LocalUserSettingsService } from '@/services/localUserSettingsService';
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

      // Salva sempre no localStorage (sem autenticação)
      const success = LocalUserSettingsService.saveSettings(userId, newSettings);
      
      if (success) {
        toast({
          title: "Configurações Salvas",
          description: "Suas configurações foram salvas localmente.",
        });
        
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
  }, [userId, currentTheme, setTheme, toast, reloadSettings]);

  return { saveSettings };
};
