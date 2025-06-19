
import { supabase } from '@/integrations/supabase/client';
import { Profile } from './types';

export const fetchProfile = async (userId: string): Promise<Profile | null> => {
  try {
    console.log('📡 Buscando perfil para userId:', userId);
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('❌ Erro ao buscar perfil:', error);
      return null;
    }

    console.log('📋 Dados do perfil retornados:', data);
    
    if (!data) {
      console.log('⚠️ Nenhum dado de perfil encontrado');
      return null;
    }

    return data as Profile;
  } catch (error) {
    console.error('💥 Erro inesperado ao buscar perfil:', error);
    return null;
  }
};
