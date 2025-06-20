
import { useMemo, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useGlobalApiKey } from '@/hooks/useGlobalApiKey';
import { useToast } from '@/hooks/use-toast';
import { ChatValidationResult } from './types';

export const useChatValidation = () => {
  const { toast } = useToast();
  const { globalApiKey, hasValidGlobalKey, loading: keyLoading } = useGlobalApiKey();
  const { user, loading: authLoading } = useAuth();
  
  // Use refs to prevent toast spam
  const lastErrorRef = useRef<string>('');

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
      const errorMessage = "Sistema carregando autenticação";
      if (lastErrorRef.current !== errorMessage) {
        console.warn('⏳ Sistema ainda carregando autenticação');
        toast({
          variant: "destructive",
          title: "Sistema carregando",
          description: "Aguarde enquanto o sistema carrega...",
        });
        lastErrorRef.current = errorMessage;
      }
      return { isValid: false, errorMessage };
    }
    
    if (!user) {
      const errorMessage = "Usuário não autenticado";
      if (lastErrorRef.current !== errorMessage) {
        console.error('❌ Usuário não autenticado');
        toast({
          variant: "destructive",
          title: "Acesso negado",
          description: "Você precisa estar logado para usar o chat.",
        });
        lastErrorRef.current = errorMessage;
      }
      return { isValid: false, errorMessage };
    }
    
    // Verificar se a chave está carregando
    if (keyLoading) {
      const errorMessage = "Sistema carregando configurações";
      if (lastErrorRef.current !== errorMessage) {
        console.warn('⏳ Sistema ainda carregando configurações da chave');
        toast({
          variant: "destructive",
          title: "Sistema carregando",
          description: "Aguarde enquanto o sistema carrega as configurações.",
        });
        lastErrorRef.current = errorMessage;
      }
      return { isValid: false, errorMessage };
    }
    
    // Verificar se temos uma chave válida
    if (!hasValidGlobalKey || !globalApiKey) {
      const errorMessage = "Sistema não configurado";
      if (lastErrorRef.current !== errorMessage) {
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
        lastErrorRef.current = errorMessage;
      }
      return { isValid: false, errorMessage };
    }

    // Reset error if validation passes
    lastErrorRef.current = '';
    return { isValid: true };
  };

  // Stable memoization to prevent infinite loops
  const isKeyConfigured = useMemo(() => {
    return Boolean(user && hasValidGlobalKey && !keyLoading && !authLoading);
  }, [user?.id, hasValidGlobalKey, keyLoading, authLoading]); // Use user.id instead of user object

  return {
    validateChatRequest,
    isKeyConfigured,
    globalApiKey,
    user,
    authLoading,
    keyLoading
  };
};
