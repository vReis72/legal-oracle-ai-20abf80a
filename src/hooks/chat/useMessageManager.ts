
import { useState, useRef } from 'react';
import { ChatMessage } from './types';

export const useMessageManager = () => {
  console.log('🔄 useMessageManager: Hook chamado');
  
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Olá! Sou o Legal Oracle IA, assistente especializado em direito. Como posso ajudar você hoje?',
      timestamp: new Date()
    }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  console.log('📊 useMessageManager: Estado atual', {
    messagesCount: messages.length,
    messagesEndRefExists: !!messagesEndRef.current
  });

  const scrollToBottom = () => {
    console.log('📜 Fazendo scroll para o final');
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const addUserMessage = (content: string): ChatMessage => {
    console.log('➕ Adicionando mensagem do usuário:', content.substring(0, 50));
    
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date()
    };
    
    setMessages(prev => {
      console.log('📝 Atualizando mensagens. Count anterior:', prev.length);
      return [...prev, userMessage];
    });
    
    setTimeout(scrollToBottom, 100);
    return userMessage;
  };

  const addAssistantMessage = (content: string) => {
    console.log('🤖 Adicionando mensagem do assistente:', content.substring(0, 50));
    
    const assistantMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content,
      timestamp: new Date()
    };
    
    setMessages(prev => {
      console.log('📝 Atualizando mensagens. Count anterior:', prev.length);
      return [...prev, assistantMessage];
    });
    
    setTimeout(scrollToBottom, 100);
  };

  const prepareConversationHistory = (userMessage: ChatMessage): ChatMessage[] => {
    console.log('🗂️ Preparando histórico da conversa');
    
    const history = [
      {
        id: 'system',
        role: 'system' as const,
        content: 'Você é um assistente especializado em direito brasileiro. Forneça respostas precisas e concisas sobre legislação, jurisprudência e consultas relacionadas ao direito.',
        timestamp: new Date()
      },
      ...messages.slice(-6),
      userMessage
    ];
    
    console.log('📋 Histórico preparado com', history.length, 'mensagens');
    return history;
  };

  console.log('🎯 useMessageManager: Retornando');

  return {
    messages,
    messagesEndRef,
    addUserMessage,
    addAssistantMessage,
    prepareConversationHistory,
    scrollToBottom
  };
};
