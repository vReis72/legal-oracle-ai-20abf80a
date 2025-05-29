
import React from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, AlertTriangle } from "lucide-react";
import OpenAIKeyInput from '@/components/shared/OpenAIKeyInput';
import { hasApiKey } from '@/services/apiKeyService';

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
  const keyExistsInStorage = hasApiKey();
  const isApiConfigured = isKeyConfigured || keyExistsInStorage;
  
  return (
    <form onSubmit={handleSendMessage} className="p-4 border-t bg-background">
      <div className="flex gap-2 items-end">
        <div className="relative flex-1">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Digite sua dúvida sobre Direito e clique no ícone de envio ao lado..."
            className="resize-none"
            rows={2}
          />
        </div>
        <Button 
          type="submit" 
          variant="ghost"
          disabled={isLoading || !input.trim() || !isApiConfigured} 
          className="p-2 hover:bg-transparent flex-shrink-0 transition-all duration-300"
        >
          <Send 
            className={`h-12 w-12 ${isApiConfigured ? 'text-eco-primary' : 'text-gray-400'} hover:scale-110 transition-transform duration-300 ease-in-out`} 
            strokeWidth={2.5} 
          />
        </Button>
      </div>
      
      {!isApiConfigured && (
        <div className="mt-2 bg-amber-50 p-3 rounded-md border border-amber-200">
          <div className="flex items-center gap-2 text-amber-700 mb-2">
            <AlertTriangle className="h-5 w-5" />
            <span className="font-medium">É necessário configurar sua chave API OpenAI</span>
          </div>
          <p className="text-sm text-amber-600 mb-3">
            Sem uma chave API válida, não é possível utilizar o assistente. Configure sua chave abaixo:
          </p>
          <OpenAIKeyInput 
            onKeySubmit={setApiKey}
            forceOpen={!isApiConfigured}
            buttonVariant="default"
            buttonSize="default"
          />
        </div>
      )}
    </form>
  );
};

export default ChatInputForm;
