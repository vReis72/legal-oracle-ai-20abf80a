
import { SearchResult, validateApiKey, handleApiError } from './types';

/**
 * Search jurisprudence using OpenAI API
 * 
 * @param query Search query text
 * @param apiKey OpenAI API key
 * @param isAdvanced Whether this is an advanced search
 * @returns Array of search results
 */
export const searchJurisprudencia = async (
  query: string, 
  apiKey: string,
  isAdvanced: boolean = false
): Promise<SearchResult[]> => {
  validateApiKey(apiKey);
  
  if (!query || query.trim().length === 0) {
    throw new Error("Nenhum termo de busca fornecido.");
  }

  console.log(`Realizando busca de jurisprudência para: "${query}"`);
  
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
            content: 'Você é um especialista em jurisprudência brasileira. Forneça resultados de busca relevantes baseados nos termos de pesquisa do usuário.'
          },
          {
            role: 'user',
            content: `${isAdvanced ? 'Busca avançada' : 'Busca simples'} de jurisprudência para: "${query}". 
            Forneça os resultados no formato JSON, com os campos:
            - id: string (identificador único)
            - tribunal: string (ex: STF, STJ, TRF-4)
            - processo: string (número do processo)
            - relator: string (nome do relator)
            - data: string (data em formato ISO)
            - ementa: string (resumo do julgado)
            - relevancia: number (0-100 representando relevância para a busca)
            - tags: array de strings (palavras-chave)
            
            Limite a resposta a 5 resultados relevantes.`
          }
        ],
        temperature: 0.3,
        max_tokens: 2000,
        response_format: { type: "json_object" }
      }),
    });

    // Check for network errors
    if (!response.ok) {
      await handleApiError(response);
    }

    const data = await response.json().catch(() => {
      throw new Error("Falha ao processar resposta da API. Formato inesperado.");
    });
    
    // Parse the content which should be JSON string
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error("Resposta vazia da API");
    }

    try {
      // Parse the JSON response
      const parsedResults = JSON.parse(content);
      
      // Normalize the results to ensure they match our interface
      const results = Array.isArray(parsedResults.results) 
        ? parsedResults.results 
        : Array.isArray(parsedResults) 
          ? parsedResults 
          : [];

      // Validate and normalize each result
      return results.map((result: any, index: number) => ({
        id: result.id || `result-${index}`,
        tribunal: result.tribunal || "Tribunal não especificado",
        processo: result.processo || "Processo não especificado",
        relator: result.relator || "Relator não especificado",
        data: result.data || new Date().toISOString().split('T')[0],
        ementa: result.ementa || "Ementa não disponível",
        relevancia: typeof result.relevancia === 'number' ? result.relevancia : 70,
        tags: Array.isArray(result.tags) ? result.tags : []
      }));
    } catch (error) {
      console.error("Erro ao analisar resultados:", error);
      throw new Error("Falha ao processar os resultados da busca");
    }
  } catch (error) {
    console.error("Falha na busca de jurisprudência:", error);
    
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error("Erro desconhecido durante a busca de jurisprudência");
  }
};
