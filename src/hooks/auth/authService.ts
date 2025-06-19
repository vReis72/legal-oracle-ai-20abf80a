
import { supabase } from '@/integrations/supabase/client';
import { Profile } from './types';

export const fetchProfile = async (userId: string): Promise<Profile | null> => {
  try {
    console.log('🔍 fetchProfile: Buscando perfil para userId:', userId);
    
    // Buscar perfil diretamente
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('❌ fetchProfile: Erro na query:', error);
      return null;
    }

    if (!data) {
      console.log('⚠️ fetchProfile: Nenhum dado retornado');
      return null;
    }

    console.log('✅ fetchProfile: Dados do banco:', {
      id: data.id,
      email: data.email,
      full_name: data.full_name,
      is_admin: data.is_admin,
      status: data.status
    });

    // Criar perfil com dados corretos
    const profile: Profile = {
      id: data.id,
      email: data.email,
      full_name: data.full_name,
      company_name: data.company_name,
      oab_number: data.oab_number,
      status: data.status || 'active',
      is_admin: data.is_admin === true, // Conversão explícita
      created_at: data.created_at,
      updated_at: data.updated_at,
      approved_at: data.approved_at,
      approved_by: data.approved_by,
      blocked_at: data.blocked_at,
      blocked_by: data.blocked_by,
      blocked_reason: data.blocked_reason
    };

    console.log('✅ fetchProfile: Perfil final criado:', {
      id: profile.id,
      email: profile.email,
      full_name: profile.full_name,
      is_admin: profile.is_admin,
      status: profile.status
    });
    
    return profile;
  } catch (error) {
    console.error('💥 fetchProfile: Erro inesperado:', error);
    return null;
  }
};
