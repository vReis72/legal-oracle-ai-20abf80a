
import React from 'react';
import { Send } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import OpenAIKeyInput from '@/components/shared/OpenAIKeyInput';

interface ChatInputFormProps {
  input: string;
  setInput: (value: string) => void;
  handleSendMessage: (e: React.FormEvent) => Promise<void>;
  isLoading: boolean;
  isKeyConfigured: boolean;
  setApiKey: (key: string) => void;
}

const ChatInputForm: React.FC<ChatInputFormProps> = ({
  input,
  setInput,
  handleSendMessage,
  isLoading,
  isKeyConfigured,
  setApiKey
}) => {
  return (
    <form onSubmit={handleSendMessage} className="p-4 border-t bg-background">
      <div className="flex gap-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Digite sua dúvida sobre direito ambiental..."
          className="resize-none"
          rows={2}
        />
        <Button 
          type="submit" 
          disabled={isLoading || !input.trim() || !isKeyConfigured} 
          size="icon"
          className="bg-eco-primary hover:bg-eco-dark"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
      {!isKeyConfigured && (
        <div className="mt-2">
          <OpenAIKeyInput 
            onKeySubmit={setApiKey}
            forceOpen={!isKeyConfigured}
            buttonVariant="default"
            buttonSize="default"
          />
        </div>
      )}
    </form>
  );
};

export default ChatInputForm;
