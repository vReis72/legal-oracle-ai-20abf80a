
import { SearchResult } from './openaiService';
import { getApiKey } from './apiKeyService';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

// Chave de desenvolvimento CORRETA
const DEVELOPMENT_API_KEY = "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";

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
    // Usar a chave fornecida ou a de desenvolvimento
    const key = apiKey || DEVELOPMENT_API_KEY || (typeof window !== 'undefined' && window.env?.OPENAI_API_KEY) || getApiKey();
    
    if (!key) {
      throw new Error('API key não fornecida. Configure sua chave OpenAI nas configurações.');
    }
    
    console.log('=== ENVIANDO MENSAGEM PARA OPENAI ===');
    console.log('Chave sendo usada:', key.substring(0, 30) + '...');
    console.log('É a chave de desenvolvimento CORRETA?', key === DEVELOPMENT_API_KEY);

    // Usar a API mais recente da OpenAI para chaves de projeto
    const baseUrl = 'https://api.openai.com/v1/chat/completions';

    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v1' // Header adicional para API mais recente
      },
      body: JSON.stringify({
        model: "gpt-4o", // Usando GPT-4o para melhores resultados
        messages: buildChatPrompt(messages),
        temperature: 0.7,
        max_tokens: 2000,
        top_p: 0.9
      }),
    });

    console.log('Resposta da API OpenAI - Status:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Erro na resposta da API OpenAI:', errorData);
      
      // Tratamento específico para erro de chave API inválida
      if (response.status === 401 && errorData.error?.code === 'invalid_api_key') {
        throw new Error(`Chave API inválida. Por favor, verifique sua chave OpenAI e configure-a novamente nas configurações.`);
      }
      
      throw new Error(`Erro na API: ${response.status} - ${errorData.error?.message || 'Erro desconhecido'}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('Resposta vazia da API');
    }
    
    console.log('Resposta recebida com sucesso da OpenAI');
    return content;
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    throw error;
  }
};
