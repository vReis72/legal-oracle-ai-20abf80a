
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useAuthActions = () => {
  const { toast } = useToast();

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Tentando fazer login para:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Erro de login:', error);
        throw error;
      }

      console.log('Login bem-sucedido:', data.user?.email);

      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo ao Legal Oracle IA.",
      });
    } catch (error: any) {
      console.error('Erro no login:', error);
      toast({
        variant: "destructive",
        title: "Erro no login",
        description: error.message || "Não foi possível fazer login. Verifique suas credenciais.",
      });
      throw error;
    }
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      console.log('Tentando criar conta para:', email);
      
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName || '',
          }
        }
      });

      if (error) {
        console.error('Erro de cadastro:', error);
        throw error;
      }

      console.log('Cadastro bem-sucedido:', data.user?.email);

      toast({
        title: "Conta criada com sucesso!",
        description: "Você já pode fazer login no sistema.",
      });
    } catch (error: any) {
      console.error('Erro no cadastro:', error);
      toast({
        variant: "destructive",
        title: "Erro no cadastro",
        description: error.message || "Não foi possível criar a conta.",
      });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      console.log('Iniciando logout...');
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Erro no logout:', error);
      } else {
        console.log('Logout realizado com sucesso');
      }
    } catch (error: any) {
      console.error('Erro inesperado no logout:', error);
    }
  };

  return { signIn, signUp, signOut };
};
