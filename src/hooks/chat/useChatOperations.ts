
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { sendChatMessage } from '@/services/chatService';
import { useChatValidation } from './useChatValidation';
import { useMessageManager } from './useMessageManager';

export const useChatOperations = () => {
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

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    const validation = validateChatRequest();
    if (!validation.isValid) {
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
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast({
        variant: "destructive",
        title: "Erro no Chat",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

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
