
import { useAuth } from '@/hooks/useAuth';
import { useGlobalApiKey } from '@/hooks/useGlobalApiKey';
import { useToast } from '@/hooks/use-toast';

export const useChatValidation = () => {
  console.log('🔄 useChatValidation: Hook chamado');
  
  const { toast } = useToast();
  const { globalApiKey, hasValidGlobalKey, loading: keyLoading } = useGlobalApiKey();
  const { user, loading: authLoading } = useAuth();

  console.log('🔍 useChatValidation: Estados atuais', {
    hasUser: !!user,
    hasValidGlobalKey,
    keyLoading,
    authLoading,
    globalApiKeyLength: globalApiKey?.length
  });

  const validateChatRequest = () => {
    console.log('🔍 Validando requisição de chat');

    if (authLoading || keyLoading) {
      console.log('⏳ Sistema ainda carregando...');
      return { isValid: false, errorMessage: "Sistema carregando..." };
    }
    
    if (!user) {
      console.log('❌ Usuário não autenticado');
      toast({
        variant: "destructive",
        title: "Acesso negado",
        description: "Você precisa estar logado para usar o chat.",
      });
      return { isValid: false, errorMessage: "Usuário não autenticado" };
    }
    
    if (!hasValidGlobalKey || !globalApiKey) {
      console.log('❌ Sistema não configurado');
      toast({
        variant: "destructive",
        title: "Sistema não configurado",
        description: "A chave API OpenAI não foi configurada pelo administrador.",
      });
      return { isValid: false, errorMessage: "Sistema não configurado" };
    }

    console.log('✅ Validação bem-sucedida');
    return { isValid: true };
  };

  const isKeyConfigured = Boolean(user && hasValidGlobalKey && !keyLoading && !authLoading);

  console.log('🎯 useChatValidation: Retornando', {
    isKeyConfigured,
    hasGlobalApiKey: !!globalApiKey,
    userExists: !!user
  });

  return {
    validateChatRequest,
    isKeyConfigured,
    globalApiKey,
    user,
    authLoading,
    keyLoading
  };
};
