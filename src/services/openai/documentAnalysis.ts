
import { validateApiKey, handleApiError } from './types';

/**
 * Analyze text content with OpenAI API
 * 
 * @param text Text content to analyze
 * @param apiKey OpenAI API key
 * @returns Analyzed content from OpenAI
 */
export const analyzeWithOpenAI = async (text: string, apiKey: string): Promise<string> => {
  validateApiKey(apiKey);
  
  if (!text || text.trim().length === 0) {
    throw new Error("Nenhum texto fornecido para análise.");
  }

  console.log(`Enviando conteúdo para análise OpenAI (${text.length} caracteres)...`);
  
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v1'
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: 'system',
            content: 'Você é um especialista em análise de documentos jurídicos brasileiros que deve sempre analisar diretamente o conteúdo fornecido, sem invenções ou suposições.'
          },
          {
            role: 'user',
            content: `Analise o seguinte documento jurídico e forneça uma análise completa e estruturada com as seguintes seções:

1. RESUMO DO DOCUMENTO:
Forneça um resumo claro e conciso que capture os principais aspectos do documento, incluindo seu contexto, propósito e conteúdo essencial.

2. PONTOS-CHAVE:
Identifique pelo menos 5 pontos-chave do documento em formato de tópicos. Para cada ponto:
- Título: Uma breve descrição
- Descrição: Explicação detalhada sobre o ponto e sua relevância

3. CONCLUSÃO:
Apresente uma conclusão objetiva sobre o documento analisado.

DOCUMENTO PARA ANÁLISE:
${text}`
          }
        ],
        temperature: 0.3,
        max_tokens: 3000
      }),
    });

    // Check for network errors
    if (!response.ok) {
      await handleApiError(response);
    }

    const data = await response.json();
    
    if (!data || !data.choices || !Array.isArray(data.choices) || data.choices.length === 0) {
      console.error("Estrutura de resposta inválida:", data);
      throw new Error("Resposta da API com estrutura inválida");
    }
    
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error("Resposta vazia da API");
    }
    
    console.log("Resposta da API OpenAI recebida com sucesso");
    console.log("Amostra do conteúdo recebido:", content.substring(0, 150) + "...");
    
    return content;
  } catch (error) {
    console.error("Falha na chamada da API OpenAI:", error);
    
    // Enhance error context
    if (error instanceof Error) {
      // Network-related errors
      if (error.message.includes('Failed to fetch') || error.message.includes('Network')) {
        throw new Error("Falha de conexão com a API OpenAI. Verifique sua conexão de internet.");
      }
      throw error;
    }
    
    throw new Error("Erro desconhecido durante a análise do documento");
  }
};
