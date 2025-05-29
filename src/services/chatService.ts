
import { useGlobalApiKey } from '@/hooks/useGlobalApiKey';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export const sendChatMessage = async (messages: ChatMessage[], globalApiKey?: string): Promise<string> => {
  if (!globalApiKey) {
    throw new Error('Chave API OpenAI não configurada pelo administrador do sistema.');
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${globalApiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      max_tokens: 1000,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    
    if (response.status === 401) {
      throw new Error('Chave API OpenAI inválida. Contate o administrador do sistema.');
    } else if (response.status === 403) {
      throw new Error('Acesso negado à API OpenAI. Verifique as permissões da chave API.');
    } else if (response.status === 429) {
      throw new Error('Limite de uso da API OpenAI excedido. Tente novamente mais tarde.');
    } else {
      throw new Error(errorData.error?.message || `Erro na API: ${response.status}`);
    }
  }

  const data = await response.json();
  
  if (!data.choices || !data.choices[0]) {
    throw new Error('Resposta inválida da API OpenAI.');
  }

  return data.choices[0].message.content;
};
