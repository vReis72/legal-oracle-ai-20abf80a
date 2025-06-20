
import { useState, useRef, useCallback } from 'react';
import { UserSettings } from '@/types/userSettings';
import { UserSettingsService } from '@/services/userSettingsService';
import { LocalUserSettingsService } from '@/services/localUserSettingsService';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/providers/ThemeProvider';

export const useSettingsLoader = (userId: string) => {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { setTheme, theme: currentTheme } = useTheme();
  
  const loadedRef = useRef(false);

  const loadSettings = useCallback(async () => {
    if (loadedRef.current) return;
    
    setIsLoading(true);
    try {
      console.log('🔄 useSettingsLoader: Carregando configurações para:', userId);
      
      // Tenta carregar do Supabase primeiro
      let userSettings = await UserSettingsService.getUserSettings(userId);
      
      // Se não conseguir do Supabase, tenta do localStorage como fallback
      if (!userSettings && !userId.startsWith('temp-user-')) {
        userSettings = LocalUserSettingsService.getUserSettings(userId);
      }
      
      setSettings(userSettings);
      loadedRef.current = true;

      // Aplica o tema salvo apenas se for diferente do atual
      if (userSettings?.theme && userSettings.theme !== currentTheme) {
        console.log('Aplicando tema salvo:', userSettings.theme);
        setTheme(userSettings.theme);
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar as configurações do usuário.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [userId, currentTheme, setTheme, toast]);

  const reloadSettings = useCallback(async () => {
    loadedRef.current = false;
    await loadSettings();
  }, [loadSettings]);

  const resetLoader = useCallback(() => {
    loadedRef.current = false;
  }, []);

  return {
    settings,
    isLoading,
    loadSettings,
    reloadSettings,
    resetLoader,
    setSettings
  };
};
