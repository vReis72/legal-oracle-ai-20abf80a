
import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChat } from '@/hooks/use-chat';
import ChatMessage from './ChatMessage';
import LoadingMessage from './LoadingMessage';
import ErrorMessage from './ErrorMessage';
import ChatInputForm from './ChatInputForm';
import ChatHeader from './ChatHeader';

const ChatInterface: React.FC = () => {
  const { 
    messages, 
    input, 
    setInput, 
    isLoading, 
    error, 
    messagesEndRef,
    handleSendMessage,
    handleRetry,
    isKeyConfigured,
    setApiKey
  } = useChat();

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] border rounded-lg bg-card overflow-hidden">
      <ChatHeader />
      
      <ScrollArea className="flex-grow p-4 space-y-4">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        
        {isLoading && <LoadingMessage />}
        
        <ErrorMessage error={error} onRetry={handleRetry} />
        
        <div ref={messagesEndRef} />
      </ScrollArea>
      
      <ChatInputForm 
        input={input}
        setInput={setInput}
        handleSendMessage={handleSendMessage}
        isLoading={isLoading}
        isKeyConfigured={isKeyConfigured}
        setApiKey={setApiKey}
      />
    </div>
  );
};

export default ChatInterface;
