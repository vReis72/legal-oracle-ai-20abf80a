
import { validateApiKey, handleApiError } from './types';

/**
 * Analyze text content with OpenAI API
 * 
 * @param text Text content to analyze
 * @param apiKey OpenAI API key
 * @returns Analyzed content from OpenAI
 */
export const analyzeWithOpenAI = async (text: string, apiKey: string): Promise<string> => {
  console.log('🔬 OpenAI DocumentAnalysis: Iniciando análise');
  console.log('🔑 OpenAI DocumentAnalysis: Chave API:', apiKey ? `${apiKey.substring(0, 10)}...${apiKey.slice(-4)}` : 'NENHUMA');
  console.log('📄 OpenAI DocumentAnalysis: Tamanho do texto:', text.length);
  
  validateApiKey(apiKey);
  
  if (!text || text.trim().length === 0) {
    console.error('❌ OpenAI DocumentAnalysis: Texto vazio fornecido');
    throw new Error("Nenhum texto fornecido para análise.");
  }

  if (text.trim().length < 50) {
    console.error('❌ OpenAI DocumentAnalysis: Texto muito curto');
    throw new Error("Texto fornecido é muito curto para análise significativa (menos de 50 caracteres).");
  }

  console.log('📤 OpenAI DocumentAnalysis: Preparando requisição para análise');
  console.log('📝 OpenAI DocumentAnalysis: Primeiros 200 caracteres:', text.substring(0, 200));
  
  const requestBody = {
    model: "gpt-4o-mini",
    messages: [
      {
        role: 'system',
        content: `Você é um especialista em análise de documentos jurídicos brasileiros com vasta experiência em várias áreas do direito.
        
Sua tarefa é analisar com precisão APENAS o texto jurídico fornecido, sem adicionar informações externas ou fazer suposições que não estejam explicitamente presentes no documento.

DIRETRIZES IMPORTANTES:
- Baseie-se EXCLUSIVAMENTE no conteúdo do documento fornecido.
- Seja preciso, objetivo e técnico em sua análise.
- Se o documento não fornecer informação suficiente, indique claramente as limitações da análise.
- Não invente informações ou contextos que não estejam presentes no texto.
- Identifique com precisão dispositivos legais, prazos, partes envolvidas e argumentos centrais do documento.
- Quando houver citação de legislação, destaque os artigos e leis mencionados.
- Seja técnico e jurídico na sua linguagem, mas mantenha clareza.`
      },
      {
        role: 'user',
        content: `Leia atentamente o texto a seguir, que foi extraído de um documento jurídico. Sua tarefa é:

1. Gerar um resumo técnico e objetivo do conteúdo do documento, indicando de forma clara o que foi tratado.
2. Listar os pontos-chave abordados no texto, especialmente aqueles que merecem atenção detalhada (ex.: dispositivos legais citados, decisões importantes, argumentos centrais, prazos, valores, partes envolvidas, etc.).
3. Apresentar uma conclusão, oferecendo um parecer sucinto e fundamentado sobre o conteúdo do documento, apontando possíveis consequências, riscos ou próximos passos relevantes a partir do que foi lido.

Documento a ser analisado:
"""
${text}
"""

Estruture sua resposta com os seguintes títulos:

**Resumo:**

[escreva aqui]

**Pontos-chave:**

[escreva aqui – utilize tópicos/bullets para cada item]

**Conclusão/Parecer:**

[escreva aqui]`
      }
    ],
    temperature: 0.0,
    max_tokens: 3000
  };

  console.log('📤 OpenAI DocumentAnalysis: Enviando requisição:', {
    model: requestBody.model,
    messageCount: requestBody.messages.length,
    maxTokens: requestBody.max_tokens,
    temperature: requestBody.temperature,
    textLength: text.length
  });
  
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v1'
      },
      body: JSON.stringify(requestBody),
    });

    console.log('📥 OpenAI DocumentAnalysis: Status da resposta:', response.status);
    console.log('📥 OpenAI DocumentAnalysis: Headers da resposta:', Object.fromEntries(response.headers.entries()));

    // Check for network errors
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ OpenAI DocumentAnalysis: Erro na resposta:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      await handleApiError(response);
    }

    const responseText = await response.text();
    console.log('📦 OpenAI DocumentAnalysis: Resposta bruta recebida (primeiros 200 chars):', responseText.substring(0, 200));

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ OpenAI DocumentAnalysis: Erro ao fazer parse da resposta:', parseError);
      console.error('❌ OpenAI DocumentAnalysis: Resposta que causou erro:', responseText);
      throw new Error('Resposta inválida da API OpenAI - não é JSON válido');
    }
    
    console.log('📊 OpenAI DocumentAnalysis: Dados da resposta:', {
      hasChoices: !!data.choices,
      choicesLength: data.choices?.length,
      hasFirstChoice: !!data.choices?.[0],
      hasMessage: !!data.choices?.[0]?.message,
      hasContent: !!data.choices?.[0]?.message?.content,
      usage: data.usage
    });
    
    if (!data || !data.choices || !Array.isArray(data.choices) || data.choices.length === 0) {
      console.error('❌ OpenAI DocumentAnalysis: Estrutura de resposta inválida:', data);
      throw new Error("Resposta da API com estrutura inválida");
    }
    
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      console.error('❌ OpenAI DocumentAnalysis: Conteúdo vazio na resposta:', data.choices[0]);
      throw new Error("Resposta vazia da API");
    }
    
    console.log('✅ OpenAI DocumentAnalysis: Análise concluída com sucesso');
    console.log('📝 OpenAI DocumentAnalysis: Conteúdo da resposta (primeiros 150 chars):', content.substring(0, 150));
    console.log('📈 OpenAI DocumentAnalysis: Tokens usados:', data.usage);
    
    return content;
  } catch (error) {
    console.error('💥 OpenAI DocumentAnalysis: Falha na chamada da API:', error);
    
    // Enhance error context
    if (error instanceof Error) {
      // Network-related errors
      if (error.message.includes('Failed to fetch') || error.message.includes('Network')) {
        console.error('🌐 OpenAI DocumentAnalysis: Erro de rede detectado');
        throw new Error("Falha de conexão com a API OpenAI. Verifique sua conexão de internet.");
      }
      throw error;
    }
    
    throw new Error("Erro desconhecido durante a análise do documento");
  }
};
