
import React from 'react';
import ChatMessage from './ChatMessage';
import ChatInputForm from './ChatInputForm';
import { useChat } from '@/hooks/use-chat';
import { Card } from "@/components/ui/card";
import { useGlobalApiKey } from '@/hooks/useGlobalApiKey';
import ChatHeader from './ChatHeader';

const ChatInterface = () => {
  console.log('🔄 ChatInterface: Componente renderizando');
  
  const { loading: loadingApiKey } = useGlobalApiKey();
  const { 
    messages, 
    input, 
    setInput, 
    handleSendMessage, 
    isLoading, 
    isKeyConfigured,
    messagesEndRef
  } = useChat();

  console.log('📊 ChatInterface: Estados', {
    loadingApiKey,
    messagesCount: messages.length,
    inputLength: input.length,
    isLoading,
    isKeyConfigured
  });

  if (loadingApiKey) {
    console.log('⏳ ChatInterface: Carregando API Key');
    return (
      <Card className="w-full max-w-4xl mx-auto h-[500px] md:h-[600px] flex items-center justify-center">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-eco-primary border-r-transparent" />
          Carregando...
        </div>
      </Card>
    );
  }

  console.log('✅ ChatInterface: Renderizando interface completa');

  return (
    <Card className="w-full max-w-4xl mx-auto h-[500px] md:h-[600px] flex flex-col">
      <ChatHeader />
      
      <div className="flex-1 overflow-y-auto p-2 md:p-4 space-y-2 md:space-y-4">
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <ChatInputForm
        input={input}
        setInput={setInput}
        handleSendMessage={handleSendMessage}
        isLoading={isLoading}
        isKeyConfigured={isKeyConfigured}
      />
    </Card>
  );
};

export default ChatInterface;
