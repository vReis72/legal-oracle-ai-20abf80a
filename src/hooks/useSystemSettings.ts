
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface SystemSettings {
  id: string;
  openai_api_key: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

export const useSystemSettings = () => {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { profile, user } = useAuth();

  const loadSettings = async () => {
    // Carrega configurações para todos os usuários autenticados
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .single();

      if (error) {
        console.error('Error loading system settings:', error);
        return;
      }

      setSettings(data);
    } catch (error) {
      console.error('Error loading system settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, [user]);

  const updateApiKey = async (apiKey: string): Promise<boolean> => {
    if (!profile?.is_admin || !settings) {
      toast({
        variant: "destructive",
        title: "Acesso negado",
        description: "Apenas administradores podem alterar as configurações.",
      });
      return false;
    }

    try {
      const { error } = await supabase
        .from('system_settings')
        .update({
          openai_api_key: apiKey,
          updated_by: profile.id,
        })
        .eq('id', settings.id);

      if (error) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Não foi possível salvar a chave API.",
        });
        return false;
      }

      toast({
        title: "Sucesso",
        description: "Chave API OpenAI atualizada com sucesso!",
      });
      
      await loadSettings();
      return true;
    } catch (error) {
      console.error('Error updating API key:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro inesperado ao salvar a chave API.",
      });
      return false;
    }
  };

  const getApiKey = (): string | null => {
    return settings?.openai_api_key || null;
  };

  return {
    settings,
    isLoading,
    isAdmin: profile?.is_admin || false,
    updateApiKey,
    getApiKey,
    reloadSettings: loadSettings,
  };
};
