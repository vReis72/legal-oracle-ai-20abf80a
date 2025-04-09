
import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, User, Bot, Loader2, RefreshCw, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ChatMessage, sendChatMessage } from '@/services/chatService';
import { useToast } from '@/hooks/use-toast';
import { useApiKey } from '@/context/ApiKeyContext';
import OpenAIKeyInput from '@/components/shared/OpenAIKeyInput';

const ChatInterface = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Olá! Sou o assistente especializado em direito ambiental. Como posso ajudar você hoje?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { apiKey, setApiKey, isKeyConfigured } = useApiKey();

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);
    
    try {
      if (!apiKey) {
        throw new Error('API Key não configurada. Por favor, configure sua chave OpenAI.');
      }
      
      // Create array with system message and conversation history
      const conversationHistory: ChatMessage[] = [
        {
          id: 'system',
          role: 'system',
          content: 'Você é um assistente especializado em direito ambiental brasileiro. Forneça respostas precisas e concisas sobre legislação ambiental, jurisprudência e consultas relacionadas ao direito ambiental. Cite leis, decisões judiciais e documentos pertinentes quando possível.',
          timestamp: new Date()
        },
        ...messages.slice(-6), // Include last 6 messages for context
        userMessage
      ];
      
      const assistantResponse = await sendChatMessage(conversationHistory, apiKey);
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: assistantResponse,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      setError((error as Error).message || 'Erro ao processar sua pergunta');
      
      toast({
        variant: "destructive",
        title: "Erro no Chat",
        description: (error as Error).message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    setError(null);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] border rounded-lg bg-card overflow-hidden">
      <div className="p-4 bg-eco-primary text-white">
        <h2 className="text-xl font-serif">Assistente de Direito Ambiental</h2>
        <p className="text-sm opacity-80">Tire suas dúvidas sobre legislação, jurisprudência e processos ambientais</p>
      </div>
      
      <ScrollArea className="flex-grow p-4 space-y-4">
        {messages.map((message) => (
          <div 
            key={message.id} 
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
        ))}
        {isLoading && (
          <div className="flex justify-start mb-4">
            <div className="bg-eco-muted text-eco-dark rounded-lg rounded-bl-none p-4 max-w-[80%]">
              <div className="flex items-center">
                <Bot className="h-4 w-4 mr-2" />
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="ml-2 text-sm">Elaborando resposta...</span>
              </div>
            </div>
          </div>
        )}
        {error && (
          <div className="flex justify-center mb-4">
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 max-w-[90%]">
              <div className="flex items-center mb-2">
                <AlertTriangle className="h-4 w-4 mr-2 text-red-500" />
                <span className="font-medium">Erro ao processar resposta</span>
              </div>
              <p className="text-sm mb-3">{error}</p>
              <div className="flex justify-end">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleRetry}
                  className="text-xs flex items-center"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Tentar novamente
                </Button>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </ScrollArea>
      
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
    </div>
  );
};

export default ChatInterface;
