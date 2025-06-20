
import { useState, useRef, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useGlobalApiKey } from '@/hooks/useGlobalApiKey';
import { useAuth } from '@/hooks/useAuth';
import { ChatMessage, sendChatMessage } from '@/services/chatService';

export const useChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Olá! Sou o Legal Oracle IA, assistente especializado em direito. Como posso ajudar você hoje?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { globalApiKey, hasValidGlobalKey, loading: keyLoading } = useGlobalApiKey();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    console.log('=== 🚀 Iniciando envio de mensagem ===');
    console.log('👤 User:', user ? `Autenticado (${user.email})` : 'Não autenticado');
    console.log('🔐 AuthLoading:', authLoading);
    console.log('🔑 KeyLoading:', keyLoading);
    console.log('✅ HasValidGlobalKey:', hasValidGlobalKey);
    console.log('🗝️ GlobalApiKey existe:', globalApiKey ? `SIM (${globalApiKey.substring(0, 7)}...${globalApiKey.slice(-4)})` : 'NÃO');
    console.log('📝 Input message:', input.substring(0, 100));
    
    // Verificar se o usuário está autenticado
    if (authLoading) {
      console.warn('⏳ Sistema ainda carregando autenticação');
      toast({
        variant: "destructive",
        title: "Sistema carregando",
        description: "Aguarde enquanto o sistema carrega...",
      });
      return;
    }
    
    if (!user) {
      console.error('❌ Usuário não autenticado');
      toast({
        variant: "destructive",
        title: "Acesso negado",
        description: "Você precisa estar logado para usar o chat.",
      });
      return;
    }
    
    // Verificar se a chave está carregando
    if (keyLoading) {
      console.warn('⏳ Sistema ainda carregando configurações da chave');
      toast({
        variant: "destructive",
        title: "Sistema carregando",
        description: "Aguarde enquanto o sistema carrega as configurações.",
      });
      return;
    }
    
    // Verificar se temos uma chave válida
    if (!hasValidGlobalKey || !globalApiKey) {
      console.error('❌ Chave global inválida ou ausente', {
        hasValidGlobalKey,
        hasGlobalApiKey: !!globalApiKey,
        keyLength: globalApiKey?.length
      });
      toast({
        variant: "destructive",
        title: "Sistema não configurado",
        description: "A chave API OpenAI não foi configurada pelo administrador. Contate o suporte.",
      });
      return;
    }
    
    console.log('✅ Todas as validações passaram, preparando mensagem do usuário');
    
    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };
    
    console.log('📨 Mensagem do usuário criada:', userMessage);
    
    setMessages(prev => {
      const newMessages = [...prev, userMessage];
      console.log('📚 Total de mensagens após adicionar usuário:', newMessages.length);
      return newMessages;
    });
    setInput('');
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🤖 Preparando conversa para OpenAI...');
      
      const conversationHistory: ChatMessage[] = [
        {
          id: 'system',
          role: 'system',
          content: 'Você é um assistente especializado em direito brasileiro. Forneça respostas precisas e concisas sobre legislação, jurisprudência e consultas relacionadas ao direito. Cite leis, decisões judiciais e documentos pertinentes quando possível.',
          timestamp: new Date()
        },
        ...messages.slice(-6),
        userMessage
      ];
      
      console.log('📚 Histórico da conversa preparado:', {
        totalMessages: conversationHistory.length,
        systemMessage: !!conversationHistory.find(m => m.role === 'system'),
        userMessages: conversationHistory.filter(m => m.role === 'user').length,
        assistantMessages: conversationHistory.filter(m => m.role === 'assistant').length
      });
      
      console.log('🚀 Chamando sendChatMessage...');
      const assistantResponse = await sendChatMessage(conversationHistory, globalApiKey);
      console.log('✅ Resposta recebida do sendChatMessage');
      console.log('📝 Resposta (primeiros 100 chars):', assistantResponse.substring(0, 100));
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: assistantResponse,
        timestamp: new Date()
      };
      
      console.log('🤖 Mensagem do assistente criada:', {
        id: assistantMessage.id,
        contentLength: assistantMessage.content.length,
        role: assistantMessage.role
      });
      
      setMessages(prev => {
        const newMessages = [...prev, assistantMessage];
        console.log('📚 Total de mensagens após adicionar assistente:', newMessages.length);
        return newMessages;
      });
      
      console.log('✅ ===== CHAT COMPLETO COM SUCESSO =====');
    } catch (error) {
      console.error('💥 ===== ERRO NO CHAT =====');
      console.error('💥 Tipo do erro:', typeof error);
      console.error('💥 Erro completo:', error);
      console.error('💥 Message do erro:', error instanceof Error ? error.message : 'Erro desconhecido');
      console.error('💥 Stack do erro:', error instanceof Error ? error.stack : 'Sem stack');
      
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setError(errorMessage);
      
      toast({
        variant: "destructive",
        title: "Erro no Chat",
        description: errorMessage,
      });
    } finally {
      console.log('🏁 Finalizando handleSendMessage');
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    console.log('🔄 Retry solicitado - limpando erro');
    setError(null);
  };

  // Sistema configurado apenas se temos usuário autenticado e chave válida
  const isKeyConfigured = user && hasValidGlobalKey && !keyLoading && !authLoading;

  console.log('🎯 useChat: Estado final:', {
    isKeyConfigured,
    user: user ? 'Logado' : 'Não logado',
    hasValidGlobalKey,
    keyLoading,
    authLoading,
    messagesCount: messages.length,
    isLoading,
    hasError: !!error
  });

  return {
    messages,
    input,
    setInput,
    isLoading,
    error,
    messagesEndRef,
    handleSendMessage,
    handleRetry,
    isKeyConfigured
  };
};
