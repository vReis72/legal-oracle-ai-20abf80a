
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
      // Se o erro for de não encontrado, retorna null silenciosamente
      if (error.code === 'PGRST116') {
        console.log('⚠️ Perfil não encontrado para o usuário:', userId);
        return null;
      }
      return null;
    }

    console.log('📋 Dados do perfil retornados:', data);
    console.log('🔍 Status de admin:', {
      is_admin: data.is_admin,
      type: typeof data.is_admin,
      email: data.email
    });
    
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
