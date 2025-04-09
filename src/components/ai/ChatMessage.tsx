
import React from 'react';
import { User, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ChatMessage as ChatMessageType } from '@/services/chatService';

interface ChatMessageProps {
  message: ChatMessageType;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  return (
    <div 
      className={cn(
        "flex mb-4",
        message.role === 'user' ? "justify-end" : "justify-start"
      )}
    >
      <div 
        className={cn(
          "max-w-[80%] rounded-lg p-4",
          message.role === 'user' 
            ? "bg-eco-primary text-white rounded-br-none" 
            : "bg-eco-muted text-eco-dark rounded-bl-none"
        )}
      >
        <div className="flex items-center mb-1">
          {message.role === 'user' ? (
            <User className="h-4 w-4 mr-2" />
          ) : (
            <Bot className="h-4 w-4 mr-2" />
          )}
          <span className="text-xs opacity-75">
            {message.role === 'user' ? 'Você' : 'EcoLegal Oracle'}
          </span>
        </div>
        <p className="whitespace-pre-wrap">{message.content}</p>
        <div className="text-right mt-1">
          <span className="text-xs opacity-60">
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
