
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { sendChatMessage } from '@/services/chatService';
import { useChatValidation } from './useChatValidation';
import { useMessageManager } from './useMessageManager';

export const useChatOperations = () => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  const { validateChatRequest, isKeyConfigured, globalApiKey } = useChatValidation();
  const { 
    messages, 
    messagesEndRef, 
    addUserMessage, 
    addAssistantMessage, 
    prepareConversationHistory 
  } = useMessageManager();

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    console.log('=== 🚀 Iniciando envio de mensagem ===');
    console.log('📝 Input message:', input.substring(0, 100));
    
    const validation = validateChatRequest();
    if (!validation.isValid) {
      return;
    }
    
    console.log('✅ Todas as validações passaram, preparando mensagem do usuário');
    
    // Capturar o input antes de limpar
    const messageContent = input.trim();
    
    // Add user message
    const userMessage = addUserMessage(messageContent);
    setInput(''); // Limpar o input imediatamente
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🤖 Preparando conversa para OpenAI...');
      
      const conversationHistory = prepareConversationHistory(userMessage);
      
      console.log('🚀 Chamando sendChatMessage...');
      const assistantResponse = await sendChatMessage(conversationHistory, globalApiKey!);
      console.log('✅ Resposta recebida do sendChatMessage');
      console.log('📝 Resposta (primeiros 100 chars):', assistantResponse.substring(0, 100));
      
      addAssistantMessage(assistantResponse);
      
      console.log('✅ ===== CHAT COMPLETO COM SUCESSO =====');
    } catch (error) {
      console.error('💥 ===== ERRO NO CHAT =====');
      console.error('💥 Tipo do erro:', typeof error);
      console.error('💥 Erro completo:', error);
      console.error('💥 Message do erro:', error instanceof Error ? error.message : 'Erro desconhecido');
      console.error('💥 Stack do erro:', error instanceof Error ? error.stack : 'Sem stack');
      
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setError(errorMessage);
      
      toast({
        variant: "destructive",
        title: "Erro no Chat",
        description: errorMessage,
      });
    } finally {
      console.log('🏁 Finalizando handleSendMessage');
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    console.log('🔄 Retry solicitado - limpando erro');
    setError(null);
  };

  return {
    messages,
    input,
    setInput,
    isLoading,
    error,
    messagesEndRef,
    handleSendMessage,
    handleRetry,
    isKeyConfigured
  };
};
