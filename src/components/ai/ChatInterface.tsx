
import React from 'react';
import ChatMessage from './ChatMessage';
import ChatInputForm from './ChatInputForm';
import { useChat } from '@/hooks/chat/useChat';
import { Card } from "@/components/ui/card";
import { useGlobalApiKey } from '@/hooks/globalApiKey/GlobalApiKeyContext';
import ChatHeader from './ChatHeader';

const ChatInterface = () => {
  const { hasValidGlobalKey, globalApiKey, loading } = useGlobalApiKey();
  const { 
    messages, 
    input, 
    setInput, 
    handleSendMessage, 
    isLoading,
    messagesEndRef
  } = useChat();

  if (loading) {
    return (
      <Card className="w-full max-w-4xl mx-auto h-[500px] md:h-[600px] flex items-center justify-center">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-eco-primary border-r-transparent" />
          Carregando...
        </div>
      </Card>
    );
  }

  const onSendMessage = async (e: React.FormEvent) => {
    if (!hasValidGlobalKey || !globalApiKey) {
      return;
    }
    
    await handleSendMessage(e, globalApiKey);
  };

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
        handleSendMessage={onSendMessage}
        isLoading={isLoading}
        isKeyConfigured={hasValidGlobalKey}
      />
    </Card>
  );
};

export default ChatInterface;
