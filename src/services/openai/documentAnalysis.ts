
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
            content: `Você é um especialista em análise de documentos jurídicos brasileiros.
            
Sua tarefa é analisar APENAS o conteúdo do documento fornecido, sem adicionar informações externas, sem fazer suposições e sem inventar ou inferir conteúdos que não estejam explicitamente presentes no documento. 

IMPORTANTE:
- Baseie-se EXCLUSIVAMENTE no texto fornecido.
- NÃO utilize conhecimentos externos que não estejam presentes no documento.
- Se o documento não fornecer informação suficiente para uma análise completa, indique isso claramente em vez de criar conteúdo fictício.
- Seja conciso e objetivo, focando nos fatos presentes no documento.
- Se o documento não for um documento jurídico ou não tiver conteúdo analisável, indique isso claramente.`
          },
          {
            role: 'user',
            content: `Analise o seguinte documento e forneça uma análise estruturada com as seguintes seções:

1. RESUMO DO DOCUMENTO:
Forneça um resumo factual e conciso que capture APENAS os principais aspectos presentes no documento, sem adicionar interpretações ou conteúdos externos.

2. PONTOS-CHAVE:
Liste de 3 a 5 pontos-chave que estejam EXPLICITAMENTE presentes no documento em formato de tópicos. Se não houver pontos claros suficientes, indique apenas os que existirem. Para cada ponto:
- Título: Uma breve descrição literal do ponto
- Descrição: Explicação baseada EXCLUSIVAMENTE no texto, com referências diretas ao conteúdo

3. CONCLUSÃO:
Apresente uma conclusão objetiva sobre o documento analisado, baseada APENAS no seu conteúdo explícito. Se o documento não permitir uma conclusão clara, indique: "Não é possível extrair uma conclusão definitiva do documento fornecido".

DOCUMENTO PARA ANÁLISE:
${text}`
          }
        ],
        temperature: 0.1, // Reduzindo para obter respostas mais determinísticas
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
