
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
        "flex mb-2 md:mb-4 px-2 md:px-0",
        message.role === 'user' ? "justify-end" : "justify-start"
      )}
    >
      <div 
        className={cn(
          "max-w-[85%] md:max-w-[80%] rounded-lg p-3 md:p-4",
          message.role === 'user' 
            ? "bg-eco-primary text-white rounded-br-none" 
            : "bg-eco-muted text-eco-dark rounded-bl-none"
        )}
      >
        <div className="flex items-center mb-1">
          {message.role === 'user' ? (
            <User className="h-3 w-3 md:h-4 md:w-4 mr-2" />
          ) : (
            <Bot className="h-3 w-3 md:h-4 md:w-4 mr-2" />
          )}
          <span className="text-xs opacity-75">
            {message.role === 'user' ? 'Você' : 'EcoLegal Oracle'}
          </span>
        </div>
        <p className="whitespace-pre-wrap text-sm md:text-base leading-relaxed">{message.content}</p>
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
