
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

  useEffect(() => {
    let mounted = true;

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        if (!mounted) return;

        if (event === 'SIGNED_OUT' || !session) {
          clearAuthState();
          setLoading(false);
          return;
        }

        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user && mounted) {
          // Use setTimeout to avoid potential deadlock
          setTimeout(async () => {
            if (mounted) {
              const userProfile = await fetchProfile(session.user.id);
              if (mounted) {
                setProfile(userProfile);
              }
            }
          }, 0);
        }
        
        setLoading(false);
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      
      console.log('Initial session:', session?.user?.email);
      
      if (!session) {
        clearAuthState();
        setLoading(false);
        return;
      }
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user && mounted) {
        fetchProfile(session.user.id).then((profile) => {
          if (mounted) {
            setProfile(profile);
          }
        });
      }
      
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const isAdmin = profile?.is_admin || false;

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
