
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
    // Clear state first to prevent UI flashing
    clearAuthState();
    await authSignOut();
  };

  // Função para recarregar o perfil do usuário
  const refreshProfile = async (userId: string) => {
    try {
      console.log('🔍 Carregando perfil do usuário:', userId);
      const userProfile = await fetchProfile(userId);
      if (userProfile) {
        console.log('✅ Perfil carregado com sucesso:', {
          id: userProfile.id,
          email: userProfile.email,
          is_admin: userProfile.is_admin,
          status: userProfile.status,
          fullDetails: userProfile
        });
        setProfile(userProfile);
      } else {
        console.log('❌ Nenhum perfil encontrado para o usuário:', userId);
        setProfile(null);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar perfil:', error);
      setProfile(null);
    }
  };

  useEffect(() => {
    let mounted = true;

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state changed:', event, session?.user?.email);
        
        if (!mounted) return;

        if (event === 'SIGNED_OUT' || !session) {
          console.log('🚪 Usuário deslogado');
          clearAuthState();
          setLoading(false);
          return;
        }

        console.log('🔐 Usuário logado:', session.user.email);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user && mounted) {
          await refreshProfile(session.user.id);
          setLoading(false);
        } else {
          setLoading(false);
        }
      }
    );

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return;
      
      console.log('🎯 Sessão inicial:', session?.user?.email);
      
      if (!session) {
        clearAuthState();
        setLoading(false);
        return;
      }
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user && mounted) {
        await refreshProfile(session.user.id);
        setLoading(false);
      } else {
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const isAdmin = Boolean(profile?.is_admin);

  console.log('🏠 Auth Provider State:', {
    user: !!user,
    userEmail: user?.email,
    profile: !!profile,
    profileEmail: profile?.email,
    isAdmin,
    profileIsAdmin: profile?.is_admin,
    profileType: typeof profile?.is_admin,
    loading,
    profileFull: profile
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
