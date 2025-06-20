
import { useState, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { sendChatMessage } from '@/services/chatService';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export const useChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Olá! Sou o Legal Oracle IA, assistente especializado em direito. Como posso ajudar você hoje?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSendMessage = async (e: React.FormEvent, apiKey?: string) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    if (!apiKey) {
      toast({
        variant: "destructive",
        title: "Sistema não configurado",
        description: "A chave API OpenAI não foi configurada.",
      });
      return;
    }
    
    const messageContent = input.trim();
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: messageContent,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setTimeout(scrollToBottom, 100);
    
    try {
      const conversationHistory = [
        {
          id: 'system',
          role: 'system' as const,
          content: 'Você é um assistente especializado em direito brasileiro. Forneça respostas precisas e concisas sobre legislação, jurisprudência e consultas relacionadas ao direito.',
          timestamp: new Date()
        },
        ...messages.slice(-6),
        userMessage
      ];
      
      const assistantResponse = await sendChatMessage(conversationHistory, apiKey);
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: assistantResponse,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setTimeout(scrollToBottom, 100);
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
    handleSendMessage
  };
};
