

import { SearchResult } from './openaiService';
import { getGlobalApiKey, hasGlobalApiKey } from '../constants/apiKeys';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

// Função para construir os prompts para a API OpenAI
const buildChatPrompt = (messages: ChatMessage[]) => {
  return messages.map(msg => ({
    role: msg.role as 'user' | 'assistant' | 'system',
    content: msg.content
  }));
};

// Função para realizar o chat com a API OpenAI
export const sendChatMessage = async (
  messages: ChatMessage[],
  userApiKey?: string
): Promise<string> => {
  try {
    // Prioridade: 1) Chave do usuário, 2) Chave global/ambiente
    const apiKey = userApiKey || getGlobalApiKey();
    
    // Validar se temos uma chave válida para usar
    if (!apiKey || apiKey === "sk-adicione-uma-chave-valida-aqui" || apiKey.length < 20 || !apiKey.startsWith('sk-')) {
      throw new Error(`
🔑 CHAVE API NECESSÁRIA: 
Para usar o chat, você precisa configurar uma chave OpenAI válida.

📝 Como obter uma chave:
1. Vá para https://platform.openai.com/api-keys
2. Crie uma nova chave API
3. Cole aqui no chat ou configure nas configurações

💡 A chave deve começar com 'sk-' e ter pelo menos 50 caracteres.
      `);
    }
    
    console.log('🚀 === ENVIANDO MENSAGEM PARA OPENAI ===');
    console.log('🔑 Usando chave:', apiKey.substring(0, 10) + '...');
    console.log('📏 Tamanho da chave:', apiKey.length);
    console.log('🎯 Formato válido?', apiKey.startsWith('sk-'));

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: buildChatPrompt(messages),
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    console.log('📡 Resposta da API OpenAI - Status:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Erro completo da API OpenAI:', errorData);
      
      if (response.status === 401) {
        throw new Error(`
❌ CHAVE API INVÁLIDA!

🔍 Detalhes do erro:
- Status: ${response.status}
- Chave enviada: ${apiKey.substring(0, 15)}...
- Erro da API: ${errorData.error?.message || 'Não especificado'}

📝 Solução:
1. Verifique se sua chave OpenAI está ativa
2. Confirme se tem créditos disponíveis
3. Gere uma nova chave se necessário
        `);
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

