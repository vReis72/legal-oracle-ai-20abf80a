
import { supabase } from '@/integrations/supabase/client';
import { Profile } from './types';

export const fetchProfile = async (userId: string): Promise<Profile | null> => {
  try {
    console.log('🔍 Buscando perfil para userId:', userId);
    
    // Tentar buscar o perfil diretamente primeiro
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('❌ Erro ao buscar perfil:', error);
      
      // Se houver erro RLS, tentar usar a função auxiliar check_is_admin para verificar se é admin
      if (error.code === '42501' || error.message.includes('policy')) {
        console.log('🔄 Tentando verificar permissões de admin...');
        
        const { data: isAdmin, error: adminError } = await supabase
          .rpc('check_is_admin', { user_id: userId });
          
        console.log('🔍 Resultado check_is_admin:', { isAdmin, adminError });
        
        if (!adminError && isAdmin) {
          // Se é admin, tentar buscar novamente (as políticas podem permitir)
          const { data: adminData, error: adminFetchError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .maybeSingle();
            
          if (!adminFetchError && adminData) {
            console.log('✅ Perfil admin carregado:', adminData);
            return adminData as Profile;
          }
        }
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
