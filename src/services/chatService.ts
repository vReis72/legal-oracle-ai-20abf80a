import { ChatMessage } from '@/hooks/chat/types';

export const sendChatMessage = async (messages: ChatMessage[], globalApiKey: string): Promise<string> => {
  console.log('🚀 ChatService: Iniciando envio para OpenAI');
  console.log('🔑 ChatService: Chave API recebida:', globalApiKey ? `${globalApiKey.substring(0, 10)}...${globalApiKey.slice(-4)}` : 'NENHUMA');
  console.log('📨 ChatService: Número de mensagens:', messages.length);
  
  if (!globalApiKey) {
    console.error('❌ ChatService: Chave API não fornecida');
    throw new Error('Chave API OpenAI não configurada pelo administrador do sistema.');
  }

  if (!globalApiKey.startsWith('sk-')) {
    console.error('❌ ChatService: Formato de chave inválido');
    throw new Error('Chave API OpenAI inválida. A chave deve começar com "sk-".');
  }

  const requestBody = {
    model: 'gpt-4o-mini',
    messages: messages.map(msg => ({
      role: msg.role,
      content: msg.content
    })),
    max_tokens: 1000,
    temperature: 0.7,
  };

  console.log('📤 ChatService: Enviando requisição:', {
    model: requestBody.model,
    messageCount: requestBody.messages.length,
    maxTokens: requestBody.max_tokens,
    temperature: requestBody.temperature
  });

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${globalApiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    console.log('📥 ChatService: Status da resposta:', response.status);
    console.log('📥 ChatService: Headers da resposta:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ ChatService: Erro na resposta:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: { message: errorText } };
      }
      
      console.error('❌ ChatService: Dados do erro:', errorData);
      
      if (response.status === 401) {
        throw new Error('Chave API OpenAI inválida. Contate o administrador do sistema.');
      } else if (response.status === 403) {
        throw new Error('Acesso negado à API OpenAI. Verifique as permissões da chave API.');
      } else if (response.status === 429) {
        throw new Error('Limite de uso da API OpenAI excedido. Tente novamente mais tarde.');
      } else {
        throw new Error(errorData.error?.message || `Erro na API: ${response.status} - ${response.statusText}`);
      }
    }

    const responseText = await response.text();
    console.log('📦 ChatService: Resposta bruta recebida (primeiros 200 chars):', responseText.substring(0, 200));

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ ChatService: Erro ao fazer parse da resposta:', parseError);
      console.error('❌ ChatService: Resposta que causou erro:', responseText);
      throw new Error('Resposta inválida da API OpenAI - não é JSON válido.');
    }
    
    console.log('📊 ChatService: Dados da resposta:', {
      hasChoices: !!data.choices,
      choicesLength: data.choices?.length,
      hasFirstChoice: !!data.choices?.[0],
      hasMessage: !!data.choices?.[0]?.message,
      hasContent: !!data.choices?.[0]?.message?.content,
      usage: data.usage
    });

    if (!data.choices || !Array.isArray(data.choices) || data.choices.length === 0) {
      console.error('❌ ChatService: Estrutura de resposta inválida:', data);
      throw new Error('Resposta inválida da API OpenAI - sem choices.');
    }

    if (!data.choices[0] || !data.choices[0].message) {
      console.error('❌ ChatService: Primeira choice inválida:', data.choices[0]);
      throw new Error('Resposta inválida da API OpenAI - choice sem message.');
    }

    const content = data.choices[0].message.content;
    if (!content) {
      console.error('❌ ChatService: Conteúdo vazio na resposta:', data.choices[0].message);
      throw new Error('Resposta vazia da API OpenAI.');
    }

    console.log('✅ ChatService: Resposta processada com sucesso');
    console.log('📝 ChatService: Conteúdo da resposta (primeiros 150 chars):', content.substring(0, 150));
    console.log('📈 ChatService: Tokens usados:', data.usage);
    
    return content;
  } catch (error) {
    if (error instanceof Error) {
      console.error('💥 ChatService: Erro capturado:', error.message);
      throw error;
    } else {
      console.error('💥 ChatService: Erro desconhecido:', error);
      throw new Error('Erro desconhecido ao processar requisição para OpenAI');
    }
  }
};
