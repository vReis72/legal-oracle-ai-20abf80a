
import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, User, Bot, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Olá! Sou o assistente especializado em direito ambiental. Como posso ajudar você hoje?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mock responses for demo
  const mockResponses = [
    "De acordo com a jurisprudência do STJ em casos semelhantes, há uma tendência clara em reconhecer a responsabilidade objetiva em danos ambientais difusos. Veja o precedente do REsp 1.454.281/MG.",
    "Analisei as resoluções recentes do CONAMA e identifiquei que a Resolução 500/2020 pode impactar diretamente seu caso, especialmente quanto aos parâmetros de licenciamento para a atividade mencionada.",
    "Conforme a Lei da Política Nacional do Meio Ambiente e seus desdobramentos jurisprudenciais, posso sugerir que a estratégia mais adequada seria contestar o auto de infração com base na ausência de nexo causal direto.",
    "Para elaborar uma impugnação eficaz neste caso, recomendo estruturar a peça em três eixos argumentativos: (1) vícios formais do auto de infração; (2) ausência de proporcionalidade na penalidade; e (3) apresentação de evidências técnicas sobre o real impacto ambiental.",
  ];

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
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      // Select a random mock response
      const responseIndex = Math.floor(Math.random() * mockResponses.length);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: mockResponses[responseIndex],
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1500);
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
            disabled={isLoading || !input.trim()} 
            size="icon"
            className="bg-eco-primary hover:bg-eco-dark"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChatInterface;
