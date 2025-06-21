
import React from 'react';
import ChatMessage from './ChatMessage';
import ChatInputForm from './ChatInputForm';
import { useChat } from '@/hooks/chat/useChat';
import { Card } from "@/components/ui/card";
import ChatHeader from './ChatHeader';

const ChatInterface = () => {
  const { 
    messages, 
    input, 
    setInput, 
    handleSendMessage, 
    isLoading,
    messagesEndRef
  } = useChat();

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
      />
    </Card>
  );
};

export default ChatInterface;
