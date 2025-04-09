import { SearchResult } from './openaiService';
import { getApiKey } from './apiKeyService';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

// Função para construir os prompts para a API OpenAI
const buildChatPrompt = (messages: ChatMessage[]) => {
  // Convert our internal message format to OpenAI's format
  return messages.map(msg => ({
    role: msg.role as 'user' | 'assistant' | 'system',
    content: msg.content
  }));
};

// Função para realizar o chat com a API OpenAI
export const sendChatMessage = async (
  messages: ChatMessage[],
  apiKey: string
): Promise<string> => {
  try {
    // Verificar se a chave foi fornecida ou usar a armazenada
    const key = apiKey || getApiKey();
    
    if (!key) {
      throw new Error('API key não fornecida');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "gpt-4o", // Usando GPT-4o para melhores resultados
        messages: buildChatPrompt(messages),
        temperature: 0.7,
        max_tokens: 2000,
        top_p: 0.9
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Erro na API: ${response.status} - ${errorData.error?.message || 'Erro desconhecido'}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('Resposta vazia da API');
    }
    
    return content;
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    throw error;
  }
};
