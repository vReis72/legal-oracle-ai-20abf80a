
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { sendChatMessage } from '@/services/chatService';
import { useChatValidation } from './useChatValidation';
import { useMessageManager } from './useMessageManager';

export const useChatOperations = () => {
  console.log('🔄 useChatOperations: Hook chamado');
  
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const { validateChatRequest, isKeyConfigured, globalApiKey } = useChatValidation();
  const { 
    messages, 
    messagesEndRef, 
    addUserMessage, 
    addAssistantMessage, 
    prepareConversationHistory 
  } = useMessageManager();

  console.log('📊 useChatOperations: Estados', {
    inputLength: input.length,
    isLoading,
    isKeyConfigured,
    messagesCount: messages.length,
    hasGlobalApiKey: !!globalApiKey
  });

  const handleSendMessage = async (e: React.FormEvent) => {
    console.log('📤 Enviando mensagem');
    e.preventDefault();
    if (!input.trim()) return;
    
    const validation = validateChatRequest();
    if (!validation.isValid) {
      console.log('❌ Validação falhou:', validation.errorMessage);
      return;
    }
    
    const messageContent = input.trim();
    const userMessage = addUserMessage(messageContent);
    setInput('');
    setIsLoading(true);
    
    try {
      const conversationHistory = prepareConversationHistory(userMessage);
      const assistantResponse = await sendChatMessage(conversationHistory, globalApiKey!);
      addAssistantMessage(assistantResponse);
      console.log('✅ Mensagem enviada com sucesso');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('💥 Erro ao enviar mensagem:', errorMessage);
      toast({
        variant: "destructive",
        title: "Erro no Chat",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  console.log('🎯 useChatOperations: Retornando');

  return {
    messages,
    input,
    setInput,
    isLoading,
    messagesEndRef,
    handleSendMessage,
    isKeyConfigured
  };
};
