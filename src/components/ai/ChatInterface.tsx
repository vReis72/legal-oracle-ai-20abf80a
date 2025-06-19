
import React, { useState, useRef, useEffect } from 'react';
import ChatMessage from './ChatMessage';
import ChatInputForm from './ChatInputForm';
import { useChat } from '@/hooks/use-chat';
import { Card } from "@/components/ui/card";
import { useGlobalApiKey } from '@/hooks/useGlobalApiKey';
import ChatHeader from './ChatHeader';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

const ChatInterface = () => {
  const [input, setInput] = useState('');
  const { hasValidGlobalKey, loading: loadingApiKey } = useGlobalApiKey();
  const { sendMessage, isLoading, messages } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !hasValidGlobalKey) return;

    const userMessage = input.trim();
    setInput('');
    
    try {
      await sendMessage(userMessage);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    }
  };

  if (loadingApiKey) {
    return (
      <Card className="w-full max-w-4xl mx-auto h-[600px] flex items-center justify-center">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-eco-primary border-r-transparent" />
          Carregando...
        </div>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto h-[600px] flex flex-col">
      <ChatHeader />
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message.text}
            sender={message.sender}
            timestamp={message.timestamp}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <ChatInputForm
        input={input}
        setInput={setInput}
        handleSendMessage={handleSendMessage}
        isLoading={isLoading}
        isKeyConfigured={hasValidGlobalKey}
      />
    </Card>
  );
};

export default ChatInterface;
