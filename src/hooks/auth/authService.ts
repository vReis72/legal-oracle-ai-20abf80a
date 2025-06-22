
import { supabase } from '@/integrations/supabase/client';
import { Profile } from './types';

export const fetchProfile = async (userId: string): Promise<Profile | null> => {
  try {
    console.log('🔍 fetchProfile: Buscando perfil para userId:', userId);
    
    // Primeiro, vamos testar a conexão com o Supabase
    const { error: connectionError } = await supabase.from('profiles').select('count').limit(1);
    if (connectionError) {
      console.error('❌ fetchProfile: Erro de conexão com Supabase:', connectionError);
      return null;
    }
    
    // Buscar perfil diretamente
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('❌ fetchProfile: Erro na query:', error);
      return null;
    }

    if (!data) {
      console.log('⚠️ fetchProfile: Nenhum perfil encontrado para userId:', userId);
      
      // Tentar buscar na tabela auth.users para verificar se o usuário existe
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error('❌ fetchProfile: Erro ao verificar usuário autenticado:', userError);
        return null;
      }
      
      if (user && user.id === userId) {
        console.log('✅ fetchProfile: Usuário existe no auth mas não tem perfil. Criando perfil básico...');
        
        // Criar perfil básico
        const newProfile = {
          id: userId,
          email: user.email || '',
          full_name: user.user_metadata?.full_name || '',
          company_name: null,
          oab_number: null,
          status: 'active' as const,
          is_admin: user.email === 'vicentereis2.celular@gmail.com',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          approved_at: null,
          approved_by: null,
          blocked_at: null,
          blocked_by: null,
          blocked_reason: null
        };
        
        // Tentar inserir o perfil
        const { data: insertedData, error: insertError } = await supabase
          .from('profiles')
          .insert(newProfile)
          .select()
          .single();
          
        if (insertError) {
          console.error('❌ fetchProfile: Erro ao criar perfil:', insertError);
          return newProfile; // Retorna o perfil mesmo sem salvar no banco
        }
        
        console.log('✅ fetchProfile: Perfil criado com sucesso:', insertedData);
        return insertedData as Profile;
      }
      
      return null;
    }

    console.log('✅ fetchProfile: Dados do banco:', {
      id: data.id,
      email: data.email,
      full_name: data.full_name,
      is_admin: data.is_admin,
      status: data.status
    });

    // Validar e definir status com tipo correto
    const validStatuses = ['pending', 'active', 'blocked'] as const;
    const status = validStatuses.includes(data.status as any) ? data.status as 'pending' | 'active' | 'blocked' : 'active';

    // Criar perfil com dados corretos
    const profile: Profile = {
      id: data.id,
      email: data.email,
      full_name: data.full_name,
      company_name: data.company_name,
      oab_number: data.oab_number,
      status: status,
      is_admin: Boolean(data.is_admin),
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
