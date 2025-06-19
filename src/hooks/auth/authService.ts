
import { supabase } from '@/integrations/supabase/client';
import { Profile } from './types';

export const fetchProfile = async (userId: string): Promise<Profile | null> => {
  try {
    console.log('🔍 Buscando perfil para userId:', userId);
    
    // Primeiro, tentar buscar o perfil diretamente
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('❌ Erro ao buscar perfil:', error);
      return null;
    }

    if (!data) {
      console.log('⚠️ Nenhum perfil encontrado para o usuário:', userId);
      return null;
    }

    console.log('✅ Perfil carregado com sucesso:', {
      id: data.id,
      email: data.email,
      full_name: data.full_name,
      is_admin: data.is_admin,
      status: data.status
    });
    
    return data as Profile;
  } catch (error) {
    console.error('💥 Erro inesperado ao buscar perfil:', error);
    return null;
  }
};
