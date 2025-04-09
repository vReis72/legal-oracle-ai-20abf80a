
import React from 'react';
import { Bot, Loader2 } from 'lucide-react';

const LoadingMessage: React.FC = () => {
  return (
    <div className="flex justify-start mb-4">
      <div className="bg-eco-muted text-eco-dark rounded-lg rounded-bl-none p-4 max-w-[80%]">
        <div className="flex items-center">
          <Bot className="h-4 w-4 mr-2" />
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="ml-2 text-sm">Elaborando resposta...</span>
        </div>
      </div>
    </div>
  );
};

export default LoadingMessage;
