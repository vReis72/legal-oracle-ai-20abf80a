
import { useState, useRef } from 'react';
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

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const addUserMessage = (content: string): ChatMessage => {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setTimeout(scrollToBottom, 100);
    return userMessage;
  };

  const addAssistantMessage = (content: string) => {
    const assistantMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, assistantMessage]);
    setTimeout(scrollToBottom, 100);
  };

  const prepareConversationHistory = (userMessage: ChatMessage): ChatMessage[] => {
    return [
      {
        id: 'system',
        role: 'system' as const,
        content: 'Você é um assistente especializado em direito brasileiro. Forneça respostas precisas e concisas sobre legislação, jurisprudência e consultas relacionadas ao direito.',
        timestamp: new Date()
      },
      ...messages.slice(-6),
      userMessage
    ];
  };

  return {
    messages,
    messagesEndRef,
    addUserMessage,
    addAssistantMessage,
    prepareConversationHistory,
    scrollToBottom
  };
};
