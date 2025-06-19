
import { useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { AuthContext } from './AuthContext';
import { useAuthActions } from './authActions';
import { fetchProfile } from './authService';
import { Profile } from './types';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { signIn, signUp, signOut: authSignOut } = useAuthActions();

  const clearAuthState = () => {
    setSession(null);
    setUser(null);
    setProfile(null);
  };

  const signOut = async () => {
    clearAuthState();
    await authSignOut();
  };

  // Função para recarregar o perfil do usuário
  const refreshProfile = async (userId: string) => {
    try {
      console.log('🔄 AuthProvider: Iniciando carregamento do perfil para:', userId);
      const userProfile = await fetchProfile(userId);
      
      if (userProfile) {
        console.log('✅ AuthProvider: Perfil carregado com sucesso:', {
          id: userProfile.id,
          email: userProfile.email,
          full_name: userProfile.full_name,
          is_admin: userProfile.is_admin,
          status: userProfile.status
        });
        setProfile(userProfile);
      } else {
        console.log('❌ AuthProvider: Perfil não encontrado, criando perfil básico');
        // Se não conseguir carregar o perfil, criar um básico com os dados do usuário
        const basicProfile: Profile = {
          id: userId,
          email: user?.email || '',
          full_name: user?.user_metadata?.full_name || null,
          company_name: null,
          oab_number: null,
          status: 'active',
          is_admin: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          approved_at: null,
          approved_by: null,
          blocked_at: null,
          blocked_by: null,
          blocked_reason: null
        };
        console.log('📝 AuthProvider: Usando perfil básico:', basicProfile);
        setProfile(basicProfile);
      }
    } catch (error) {
      console.error('❌ AuthProvider: Erro ao carregar perfil:', error);
      setProfile(null);
    }
  };

  useEffect(() => {
    let mounted = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 AuthProvider: Auth state changed:', event, session?.user?.email);
        
        if (!mounted) return;

        if (event === 'SIGNED_OUT' || !session) {
          console.log('🚪 AuthProvider: Usuário deslogado');
          clearAuthState();
          setLoading(false);
          return;
        }

        console.log('🔐 AuthProvider: Usuário logado:', session.user.email);
        setSession(session);
        setUser(session.user);
        
        if (session.user && mounted) {
          // Pequeno delay para garantir que o perfil foi criado
          setTimeout(() => {
            refreshProfile(session.user.id);
          }, 500);
        }
        
        setLoading(false);
      }
    );

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return;
      
      console.log('🎯 AuthProvider: Sessão inicial:', session?.user?.email);
      
      if (!session) {
        clearAuthState();
        setLoading(false);
        return;
      }
      
      setSession(session);
      setUser(session.user);
      
      if (session.user && mounted) {
        setTimeout(() => {
          refreshProfile(session.user.id);
        }, 500);
      }
      
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const isAdmin = Boolean(profile?.is_admin);

  console.log('🏠 AuthProvider State:', {
    hasUser: !!user,
    userEmail: user?.email,
    hasProfile: !!profile,
    profileEmail: profile?.email,
    profileFullName: profile?.full_name,
    isAdmin,
    profileIsAdmin: profile?.is_admin,
    loading
  });

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      session,
      loading,
      signIn,
      signUp,
      signOut,
      isAdmin
    }}>
      {children}
    </AuthContext.Provider>
  );
};
