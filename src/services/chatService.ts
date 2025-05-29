
import { SearchResult } from './openaiService';
import { DEVELOPMENT_API_KEY } from '../context/utils/apiKeyUtils';

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
  apiKey?: string
): Promise<string> => {
  try {
    // SEMPRE usar a chave de desenvolvimento em modo desenvolvimento
    const key = DEVELOPMENT_API_KEY;
    
    console.log('🚀 === ENVIANDO MENSAGEM PARA OPENAI ===');
    console.log('🔑 Usando chave de desenvolvimento FIXA');
    console.log('📝 Chave sendo enviada:', key);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v1'
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: buildChatPrompt(messages),
        temperature: 0.7,
        max_tokens: 2000,
        top_p: 0.9
      }),
    });

    console.log('📡 Resposta da API OpenAI - Status:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Erro na resposta da API OpenAI:', errorData);
      
      if (response.status === 401) {
        console.error('❌ CHAVE API INVÁLIDA! Chave enviada:', key);
        throw new Error(`Chave API inválida. Chave enviada: ${key.substring(0, 20)}...`);
      }
      
      throw new Error(`Erro na API: ${response.status} - ${errorData.error?.message || 'Erro desconhecido'}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('Resposta vazia da API');
    }
    
    console.log('✅ Resposta recebida com sucesso da OpenAI');
    return content;
  } catch (error) {
    console.error('❌ Erro ao enviar mensagem:', error);
    throw error;
  }
};
