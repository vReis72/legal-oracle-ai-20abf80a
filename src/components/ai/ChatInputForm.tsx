
import React from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ChatInputFormProps {
  input: string;
  setInput: (value: string) => void;
  handleSendMessage: (e: React.FormEvent) => Promise<void>;
  isLoading: boolean;
  isKeyConfigured: boolean;
}

const ChatInputForm: React.FC<ChatInputFormProps> = ({
  input,
  setInput,
  handleSendMessage,
  isLoading,
  isKeyConfigured
}) => {
  return (
    <form onSubmit={handleSendMessage} className="p-3 md:p-4 border-t bg-background">
      <div className="flex gap-2 items-end">
        <div className="relative flex-1">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              isKeyConfigured 
                ? "Digite sua dúvida sobre Direito..."
                : "Sistema desabilitado - configure uma chave API"
            }
            className="resize-none text-sm md:text-base"
            rows={2}
            disabled={!isKeyConfigured}
          />
        </div>
        <Button 
          type="submit" 
          variant="ghost"
          disabled={isLoading || !input.trim() || !isKeyConfigured} 
          className="p-2 hover:bg-transparent flex-shrink-0"
        >
          <Send 
            className={`h-8 w-8 md:h-12 md:w-12 ${
              isKeyConfigured 
                ? 'text-eco-primary hover:scale-110' 
                : 'text-gray-400'
            } transition-transform duration-300 ease-in-out`} 
            strokeWidth={2.5} 
          />
        </Button>
      </div>
      
      {!isKeyConfigured && (
        <Alert variant="destructive" className="mt-2">
          <AlertTriangle className="h-4 w-4 md:h-5 md:w-5" />
          <AlertDescription className="text-sm">
            ❌ Sistema desabilitado. Configure uma chave API.
          </AlertDescription>
        </Alert>
      )}
    </form>
  );
};

export default ChatInputForm;
