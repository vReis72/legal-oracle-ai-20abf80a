
import { useState, useRef, useCallback } from 'react';
import { UserSettings } from '@/types/userSettings';
import { LocalUserSettingsService } from '@/services/localUserSettingsService';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/providers/ThemeProvider';

export const useSettingsLoader = (userId: string) => {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { setTheme } = useTheme();
  
  const hasLoadedRef = useRef(false);
  const isLoadingRef = useRef(false);

  const loadSettings = useCallback(async () => {
    // Prevent multiple simultaneous calls
    if (isLoadingRef.current || hasLoadedRef.current) {
      console.log('🔄 useSettingsLoader: Já carregado ou carregando, ignorando...');
      return;
    }
    
    isLoadingRef.current = true;
    setIsLoading(true);
    
    try {
      console.log('🔄 useSettingsLoader: Carregando configurações para:', userId);
      
      const userSettings = LocalUserSettingsService.getUserSettings(userId);
      console.log('🔄 useSettingsLoader: Configurações carregadas:', userSettings);
      
      setSettings(userSettings);
      hasLoadedRef.current = true;

      // Apply saved theme only if it exists
      if (userSettings?.theme) {
        console.log('🎨 useSettingsLoader: Aplicando tema salvo:', userSettings.theme);
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
      isLoadingRef.current = false;
      setIsLoading(false);
    }
  }, [userId, setTheme, toast]);

  const reloadSettings = useCallback(async () => {
    console.log('🔄 useSettingsLoader: Forçando recarregamento');
    hasLoadedRef.current = false;
    isLoadingRef.current = false;
    await loadSettings();
  }, [loadSettings]);

  const resetLoader = useCallback(() => {
    console.log('🔄 useSettingsLoader: Resetando loader');
    hasLoadedRef.current = false;
    isLoadingRef.current = false;
    setSettings(null);
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
