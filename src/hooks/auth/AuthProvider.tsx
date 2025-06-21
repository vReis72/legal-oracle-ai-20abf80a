
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
    console.log('🧹 AuthProvider: Limpando estado');
    setSession(null);
    setUser(null);
    setProfile(null);
  };

  const signOut = async () => {
    clearAuthState();
    await authSignOut();
  };

  const loadUserProfile = async (userId: string) => {
    try {
      console.log('🔄 AuthProvider: Carregando perfil para:', userId);
      const userProfile = await fetchProfile(userId);
      
      console.log('🔄 AuthProvider: Perfil carregado:', {
        profile: userProfile,
        isAdmin: userProfile?.is_admin,
        status: userProfile?.status
      });
      
      setProfile(userProfile);
      return userProfile;
    } catch (error) {
      console.error('❌ AuthProvider: Erro ao carregar perfil:', error);
      setProfile(null);
      return null;
    }
  };

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        console.log('🎯 AuthProvider: Inicializando...');
        
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ AuthProvider: Erro ao obter sessão:', error);
        }
        
        if (currentSession && mounted) {
          console.log('✅ AuthProvider: Sessão encontrada para:', currentSession.user.email);
          setSession(currentSession);
          setUser(currentSession.user);
          
          // Carregar perfil
          await loadUserProfile(currentSession.user.id);
        } else {
          console.log('🔍 AuthProvider: Nenhuma sessão encontrada');
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

    // Configurar listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('🔄 AuthProvider: Auth state changed:', event, newSession?.user?.email);
        
        if (!mounted) return;

        if (event === 'SIGNED_OUT' || !newSession) {
          console.log('🚪 AuthProvider: Usuário deslogado');
          clearAuthState();
          setLoading(false);
          return;
        }

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          console.log('🔐 AuthProvider: Usuário logado:', newSession.user.email);
          setSession(newSession);
          setUser(newSession.user);
          
          if (newSession.user && mounted) {
            await loadUserProfile(newSession.user.id);
          }
          
          setLoading(false);
        }
      }
    );

    initAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Calcular isAdmin de forma mais robusta e com logs detalhados
  const isAdmin = Boolean(profile?.is_admin === true);

  console.log('🏠 AuthProvider: Estado FINAL:', {
    hasUser: !!user,
    userEmail: user?.email,
    hasProfile: !!profile,
    profileData: profile,
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
