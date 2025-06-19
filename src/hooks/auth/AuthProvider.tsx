
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
    console.log('🧹 AuthProvider: Limpando estado de autenticação');
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
      console.log('🔄 AuthProvider: Iniciando refreshProfile para:', userId);
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
        console.log('❌ AuthProvider: Nenhum perfil retornado');
        setProfile(null);
      }
    } catch (error) {
      console.error('❌ AuthProvider: Erro ao carregar perfil:', error);
      setProfile(null);
    }
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log('🎯 AuthProvider: Inicializando autenticação...');
        
        // Primeiro, verificar se já temos uma sessão
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ AuthProvider: Erro ao obter sessão inicial:', error);
        }
        
        if (initialSession && mounted) {
          console.log('✅ AuthProvider: Sessão inicial encontrada:', initialSession.user.email);
          setSession(initialSession);
          setUser(initialSession.user);
          await refreshProfile(initialSession.user.id);
        } else {
          console.log('🔍 AuthProvider: Nenhuma sessão inicial encontrada');
        }
        
        if (mounted) {
          setLoading(false);
        }
      } catch (error) {
        console.error('💥 AuthProvider: Erro na inicialização:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Configurar listener de mudanças de autenticação
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

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          console.log('🔐 AuthProvider: Usuário logado/token atualizado:', session.user.email);
          setSession(session);
          setUser(session.user);
          
          if (session.user && mounted) {
            await refreshProfile(session.user.id);
          }
          
          setLoading(false);
        }
      }
    );

    // Inicializar
    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const isAdmin = Boolean(profile?.is_admin);

  console.log('🏠 AuthProvider: Estado atual:', {
    hasUser: !!user,
    userEmail: user?.email,
    hasProfile: !!profile,
    profileEmail: profile?.email,
    profileFullName: profile?.full_name,
    profileIsAdmin: profile?.is_admin,
    calculatedIsAdmin: isAdmin,
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
