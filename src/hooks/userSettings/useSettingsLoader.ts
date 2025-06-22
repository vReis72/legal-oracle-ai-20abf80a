
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
  const lastUserIdRef = useRef<string | null>(null);
  const isLoadingRef = useRef(false);

  const loadSettings = useCallback(async () => {
    console.log('🔄 useSettingsLoader: Tentando carregar configurações', {
      userId,
      hasLoaded: hasLoadedRef.current,
      lastUserId: lastUserIdRef.current,
      isLoadingNow: isLoadingRef.current
    });

    // Evitar múltiplas chamadas simultâneas
    if (isLoadingRef.current) {
      console.log('🔄 useSettingsLoader: Já está carregando, ignorando...');
      return;
    }

    // Se já carregou para este usuário, não recarregar
    if (hasLoadedRef.current && lastUserIdRef.current === userId) {
      console.log('🔄 useSettingsLoader: Configurações já carregadas para este usuário');
      return;
    }
    
    isLoadingRef.current = true;
    setIsLoading(true);
    
    try {
      console.log('🔄 useSettingsLoader: Carregando configurações do localStorage para:', userId);
      
      // Carrega sempre do localStorage
      const userSettings = LocalUserSettingsService.getUserSettings(userId);
      console.log('🔄 useSettingsLoader: Configurações carregadas:', userSettings);
      
      setSettings(userSettings);
      hasLoadedRef.current = true;
      lastUserIdRef.current = userId;

      // Aplica o tema salvo apenas se existir
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
    lastUserIdRef.current = null;
    isLoadingRef.current = false;
    await loadSettings();
  }, [loadSettings]);

  const resetLoader = useCallback(() => {
    console.log('🔄 useSettingsLoader: Resetando loader');
    hasLoadedRef.current = false;
    lastUserIdRef.current = null;
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
