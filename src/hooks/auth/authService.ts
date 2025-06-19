
import { supabase } from '@/integrations/supabase/client';
import { Profile } from './types';

export const fetchProfile = async (userId: string): Promise<Profile | null> => {
  try {
    console.log('🔍 fetchProfile: Iniciando busca do perfil para userId:', userId);
    
    // Verificar se temos uma sessão ativa
    const { data: { session } } = await supabase.auth.getSession();
    console.log('🔐 fetchProfile: Sessão ativa:', !!session);
    
    if (!session) {
      console.log('❌ fetchProfile: Sem sessão ativa');
      return null;
    }

    // Buscar perfil diretamente da tabela profiles
    console.log('📊 fetchProfile: Fazendo query na tabela profiles...');
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('❌ fetchProfile: Erro na query:', error);
      console.error('❌ fetchProfile: Código do erro:', error.code);
      console.error('❌ fetchProfile: Mensagem do erro:', error.message);
      return null;
    }

    if (!data) {
      console.log('⚠️ fetchProfile: Nenhum dado retornado');
      return null;
    }

    console.log('✅ fetchProfile: Dados brutos do banco:', data);
    console.log('✅ fetchProfile: is_admin no banco:', data.is_admin, typeof data.is_admin);
    console.log('✅ fetchProfile: status no banco:', data.status, typeof data.status);
    
    // Garantir que o status seja um dos valores permitidos
    const validStatus = ['pending', 'active', 'blocked'] as const;
    const normalizedStatus = validStatus.includes(data.status as any) 
      ? data.status as 'pending' | 'active' | 'blocked'
      : 'active'; // fallback para 'active' se o status não for válido

    const profile: Profile = {
      id: data.id,
      email: data.email,
      full_name: data.full_name,
      company_name: data.company_name,
      oab_number: data.oab_number,
      status: normalizedStatus,
      is_admin: Boolean(data.is_admin), // Garantir que é boolean
      created_at: data.created_at,
      updated_at: data.updated_at,
      approved_at: data.approved_at,
      approved_by: data.approved_by,
      blocked_at: data.blocked_at,
      blocked_by: data.blocked_by,
      blocked_reason: data.blocked_reason
    };

    console.log('✅ fetchProfile: Perfil processado:', {
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
