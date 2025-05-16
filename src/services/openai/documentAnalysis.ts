
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

  if (text.trim().length < 50) {
    throw new Error("Texto fornecido é muito curto para análise significativa (menos de 50 caracteres).");
  }

  console.log(`Enviando conteúdo para análise OpenAI (${text.length} caracteres)...`);
  console.log("Primeiros 200 caracteres do texto enviado para análise:", text.substring(0, 200));
  
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
    console.log("Total de caracteres na resposta:", content.length);
    
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
