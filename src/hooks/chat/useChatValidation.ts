
import { useAuth } from '@/hooks/useAuth';
import { useGlobalApiKey } from '@/hooks/useGlobalApiKey';
import { useToast } from '@/hooks/use-toast';

export const useChatValidation = () => {
  const { toast } = useToast();
  const { globalApiKey, hasValidGlobalKey, loading: keyLoading } = useGlobalApiKey();
  const { user, loading: authLoading } = useAuth();

  const validateChatRequest = () => {
    if (authLoading || keyLoading) {
      return { isValid: false, errorMessage: "Sistema carregando..." };
    }
    
    if (!user) {
      toast({
        variant: "destructive",
        title: "Acesso negado",
        description: "Você precisa estar logado para usar o chat.",
      });
      return { isValid: false, errorMessage: "Usuário não autenticado" };
    }
    
    if (!hasValidGlobalKey || !globalApiKey) {
      toast({
        variant: "destructive",
        title: "Sistema não configurado",
        description: "A chave API OpenAI não foi configurada pelo administrador.",
      });
      return { isValid: false, errorMessage: "Sistema não configurado" };
    }

    return { isValid: true };
  };

  const isKeyConfigured = Boolean(user && hasValidGlobalKey && !keyLoading && !authLoading);

  return {
    validateChatRequest,
    isKeyConfigured,
    globalApiKey,
    user,
    authLoading,
    keyLoading
  };
};
