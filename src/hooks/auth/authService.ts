
import { supabase } from '@/integrations/supabase/client';
import { Profile } from './types';

export const fetchProfile = async (userId: string): Promise<Profile | null> => {
  try {
    console.log('🔍 Buscando perfil para userId:', userId);
    
    // Tentar buscar o perfil diretamente sem políticas RLS primeiro
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('❌ Erro ao buscar perfil:', error);
      
      // Se o erro for de política RLS, tentar buscar como service role
      if (error.code === '42501' || error.message.includes('RLS')) {
        console.log('🔄 Tentando buscar perfil com bypass RLS...');
        
        // Tentar uma abordagem diferente - usando a função SQL diretamente
        const { data: profileData, error: functionError } = await supabase
          .rpc('get_user_profile', { user_id: userId });
          
        if (functionError) {
          console.error('❌ Erro na função get_user_profile:', functionError);
          return null;
        }
        
        console.log('✅ Perfil obtido via função:', profileData);
        return profileData as Profile;
      }
      
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
