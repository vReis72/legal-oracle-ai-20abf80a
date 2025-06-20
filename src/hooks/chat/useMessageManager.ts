
import { useState, useRef, useCallback } from 'react';
import { ChatMessage } from './types';

export const useMessageManager = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Olá! Sou o Legal Oracle IA, assistente especializado em direito. Como posso ajudar você hoje?',
      timestamp: new Date()
    }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  const addUserMessage = useCallback((content: string): ChatMessage => {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date()
    };
    
    console.log('📨 Mensagem do usuário criada:', userMessage);
    
    setMessages(prev => {
      const newMessages = [...prev, userMessage];
      console.log('📚 Total de mensagens após adicionar usuário:', newMessages.length);
      return newMessages;
    });

    // Schedule scroll after state update
    requestAnimationFrame(() => {
      scrollToBottom();
    });

    return userMessage;
  }, [scrollToBottom]);

  const addAssistantMessage = useCallback((content: string) => {
    const assistantMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content,
      timestamp: new Date()
    };
    
    console.log('🤖 Mensagem do assistente criada:', {
      id: assistantMessage.id,
      contentLength: assistantMessage.content.length,
      role: assistantMessage.role
    });
    
    setMessages(prev => {
      const newMessages = [...prev, assistantMessage];
      console.log('📚 Total de mensagens após adicionar assistente:', newMessages.length);
      return newMessages;
    });

    // Schedule scroll after state update
    requestAnimationFrame(() => {
      scrollToBottom();
    });
  }, [scrollToBottom]);

  const prepareConversationHistory = useCallback((userMessage: ChatMessage): ChatMessage[] => {
    const conversationHistory: ChatMessage[] = [
      {
        id: 'system',
        role: 'system',
        content: 'Você é um assistente especializado em direito brasileiro. Forneça respostas precisas e concisas sobre legislação, jurisprudência e consultas relacionadas ao direito. Cite leis, decisões judiciais e documentos pertinentes quando possível.',
        timestamp: new Date()
      },
      ...messages.slice(-6),
      userMessage
    ];
    
    console.log('📚 Histórico da conversa preparado:', {
      totalMessages: conversationHistory.length,
      systemMessage: !!conversationHistory.find(m => m.role === 'system'),
      userMessages: conversationHistory.filter(m => m.role === 'user').length,
      assistantMessages: conversationHistory.filter(m => m.role === 'assistant').length
    });

    return conversationHistory;
  }, [messages]);

  return {
    messages,
    messagesEndRef,
    addUserMessage,
    addAssistantMessage,
    prepareConversationHistory,
    scrollToBottom
  };
};
