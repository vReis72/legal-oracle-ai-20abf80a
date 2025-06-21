
import React from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";

interface ChatInputFormProps {
  input: string;
  setInput: (value: string) => void;
  handleSendMessage: (e: React.FormEvent) => Promise<void>;
  isLoading: boolean;
}

const ChatInputForm: React.FC<ChatInputFormProps> = ({
  input,
  setInput,
  handleSendMessage,
  isLoading
}) => {
  return (
    <form onSubmit={handleSendMessage} className="p-3 md:p-4 border-t bg-background">
      <div className="flex gap-2 items-end">
        <div className="relative flex-1">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Digite sua dúvida sobre Direito..."
            className="resize-none text-sm md:text-base"
            rows={2}
          />
        </div>
        <Button 
          type="submit" 
          variant="ghost"
          disabled={isLoading || !input.trim()} 
          className="p-2 hover:bg-transparent flex-shrink-0"
        >
          <Send 
            className="h-8 w-8 md:h-12 md:w-12 text-eco-primary hover:scale-110 transition-transform duration-300 ease-in-out" 
            strokeWidth={2.5} 
          />
        </Button>
      </div>
    </form>
  );
};

export default ChatInputForm;
