
import { useAuth } from '@/hooks/useAuth';
import { useGlobalApiKey } from '@/hooks/useGlobalApiKey';
import { useToast } from '@/hooks/use-toast';
import { ChatValidationResult } from './types';

export const useChatValidation = () => {
  const { toast } = useToast();
  const { globalApiKey, hasValidGlobalKey, loading: keyLoading } = useGlobalApiKey();
  const { user, loading: authLoading } = useAuth();

  const validateChatRequest = (): ChatValidationResult => {
    console.log('🔍 Validando requisição de chat:', {
      user: user ? `Autenticado (${user.email})` : 'Não autenticado',
      authLoading,
      keyLoading,
      hasValidGlobalKey,
      globalApiKey: globalApiKey ? `${globalApiKey.substring(0, 7)}...${globalApiKey.slice(-4)}` : 'NENHUMA'
    });

    // Verificar se o usuário está autenticado
    if (authLoading) {
      console.warn('⏳ Sistema ainda carregando autenticação');
      toast({
        variant: "destructive",
        title: "Sistema carregando",
        description: "Aguarde enquanto o sistema carrega...",
      });
      return { isValid: false, errorMessage: "Sistema carregando autenticação" };
    }
    
    if (!user) {
      console.error('❌ Usuário não autenticado');
      toast({
        variant: "destructive",
        title: "Acesso negado",
        description: "Você precisa estar logado para usar o chat.",
      });
      return { isValid: false, errorMessage: "Usuário não autenticado" };
    }
    
    // Verificar se a chave está carregando
    if (keyLoading) {
      console.warn('⏳ Sistema ainda carregando configurações da chave');
      toast({
        variant: "destructive",
        title: "Sistema carregando",
        description: "Aguarde enquanto o sistema carrega as configurações.",
      });
      return { isValid: false, errorMessage: "Sistema carregando configurações" };
    }
    
    // Verificar se temos uma chave válida
    if (!hasValidGlobalKey || !globalApiKey) {
      console.error('❌ Chave global inválida ou ausente', {
        hasValidGlobalKey,
        hasGlobalApiKey: !!globalApiKey,
        keyLength: globalApiKey?.length
      });
      toast({
        variant: "destructive",
        title: "Sistema não configurado",
        description: "A chave API OpenAI não foi configurada pelo administrador. Contate o suporte.",
      });
      return { isValid: false, errorMessage: "Sistema não configurado" };
    }

    return { isValid: true };
  };

  // Sistema configurado apenas se temos usuário autenticado e chave válida
  const isKeyConfigured = user && hasValidGlobalKey && !keyLoading && !authLoading;

  return {
    validateChatRequest,
    isKeyConfigured,
    globalApiKey,
    user,
    authLoading,
    keyLoading
  };
};
