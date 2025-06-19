
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
      console.log('🔄 AuthProvider: Carregando perfil para:', userId);
      const userProfile = await fetchProfile(userId);
      
      if (userProfile) {
        console.log('✅ AuthProvider: Perfil carregado:', {
          id: userProfile.id,
          email: userProfile.email,
          full_name: userProfile.full_name,
          is_admin: userProfile.is_admin,
          status: userProfile.status
        });
        setProfile(userProfile);
      } else {
        console.log('❌ AuthProvider: Perfil não encontrado');
        setProfile(null);
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
          await refreshProfile(session.user.id);
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
        await refreshProfile(session.user.id);
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
