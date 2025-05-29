
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
      console.log('🔍 Carregando configurações do sistema...');
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .single();

      if (error) {
        console.error('❌ Erro ao carregar configurações do sistema:', error);
        // Se não existir configuração e o usuário for admin, criar uma vazia
        if (error.code === 'PGRST116' && profile?.is_admin) {
          console.log('🚀 Criando configuração inicial do sistema...');
          const { data: newData, error: createError } = await supabase
            .from('system_settings')
            .insert({
              openai_api_key: null,
              updated_by: profile.id,
            })
            .select()
            .single();

          if (!createError) {
            setSettings(newData);
            console.log('✅ Configuração inicial criada');
          }
        }
        setSettings(null);
        return;
      }

      setSettings(data);
      console.log('✅ Configurações do sistema carregadas:', data?.openai_api_key ? 'com chave API' : 'sem chave API');
    } catch (error) {
      console.error('❌ Erro inesperado ao carregar configurações:', error);
      setSettings(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, [user, profile]);

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
      console.log('💾 Salvando chave API global...');
      const { error } = await supabase
        .from('system_settings')
        .update({
          openai_api_key: apiKey,
          updated_by: profile.id,
        })
        .eq('id', settings.id);

      if (error) {
        console.error('❌ Erro ao salvar chave API:', error);
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
      console.log('✅ Chave API global salva com sucesso');
      return true;
    } catch (error) {
      console.error('❌ Erro inesperado ao salvar chave API:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro inesperado ao salvar a chave API.",
      });
      return false;
    }
  };

  const getApiKey = (): string | null => {
    const key = settings?.openai_api_key || null;
    console.log('🔑 getApiKey chamado:', key ? 'chave encontrada' : 'sem chave');
    return key;
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
