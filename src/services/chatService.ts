
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export const sendChatMessage = async (messages: ChatMessage[], globalApiKey: string): Promise<string> => {
  console.log('ChatService: Iniciando envio para OpenAI');
  console.log('ChatService: Chave API recebida:', globalApiKey ? globalApiKey.substring(0, 10) + '...' : 'NENHUMA');
  
  if (!globalApiKey) {
    throw new Error('Chave API OpenAI não configurada pelo administrador do sistema.');
  }

  if (!globalApiKey.startsWith('sk-')) {
    throw new Error('Chave API OpenAI inválida. A chave deve começar com "sk-".');
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${globalApiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      max_tokens: 1000,
      temperature: 0.7,
    }),
  });

  console.log('ChatService: Status da resposta:', response.status);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('ChatService: Erro da API:', errorData);
    
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

  console.log('ChatService: Resposta recebida com sucesso');
  return data.choices[0].message.content;
};
