
import { toast } from "sonner";

/**
 * Interface for search result data structure
 */
export interface SearchResult {
  id: string;
  tribunal: string;
  processo: string;
  relator: string;
  data: string;
  ementa: string;
  relevancia: number;
  tags: string[];
}

/**
 * Analyze text content with OpenAI API
 * 
 * @param text Text content to analyze
 * @param apiKey OpenAI API key
 * @returns Analyzed content from OpenAI
 */
export const analyzeWithOpenAI = async (text: string, apiKey: string): Promise<string> => {
  if (!apiKey) {
    throw new Error("API key não fornecida. Configure sua chave OpenAI nas configurações.");
  }
  
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
            content: 'Você é um especialista em análise de documentos jurídicos brasileiros. Analise este documento e forneça um resumo detalhado, destacando os pontos mais importantes e relevantes. Não mencione em sua análise que o documento é simulado ou fictício.'
          },
          {
            role: 'user',
            content: `Analise o seguinte documento jurídico e forneça: 
            1. Um resumo detalhado 
            2. Os principais destaques com sua importância (alta, média, baixa)
            3. Os pontos-chave com título e descrição
            
            IMPORTANTE: Este é um documento real que precisa de análise profissional. NÃO mencione que o documento é fictício ou simulado em sua análise.
            
            DOCUMENTO:
            ${text}`
          }
        ],
        temperature: 0.2,
        max_tokens: 2000
      }),
    });

    // Check for network errors
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: { message: 'Erro desconhecido' } }));
      console.error("Erro na API OpenAI:", errorData);
      
      // Handle common HTTP errors with more specific messages
      if (response.status === 401) {
        throw new Error("API key inválida ou expirada. Verifique suas credenciais.");
      } else if (response.status === 429) {
        throw new Error("Limite de requisições excedido. Tente novamente mais tarde.");
      } else if (response.status === 500) {
        throw new Error("Erro no servidor OpenAI. Tente novamente mais tarde.");
      } else {
        throw new Error(`Erro na API: ${response.status} - ${errorData.error?.message || 'Erro desconhecido'}`);
      }
    }

    const data = await response.json().catch(() => {
      throw new Error("Falha ao processar resposta da API. Formato inesperado.");
    });
    
    // Validate response structure
    if (!data || !data.choices || !Array.isArray(data.choices) || data.choices.length === 0) {
      console.error("Estrutura de resposta inválida:", data);
      throw new Error("Resposta da API com estrutura inválida");
    }
    
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error("Resposta vazia da API");
    }
    
    console.log("Resposta da API OpenAI recebida com sucesso");
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
  if (!apiKey) {
    throw new Error("API key não fornecida. Configure sua chave OpenAI nas configurações.");
  }
  
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
      const errorData = await response.json().catch(() => ({ error: { message: 'Erro desconhecido' } }));
      console.error("Erro na API OpenAI:", errorData);
      
      // Handle common HTTP errors with more specific messages
      if (response.status === 401) {
        throw new Error("API key inválida ou expirada. Verifique suas credenciais.");
      } else if (response.status === 429) {
        throw new Error("Limite de requisições excedido. Tente novamente mais tarde.");
      } else if (response.status === 500) {
        throw new Error("Erro no servidor OpenAI. Tente novamente mais tarde.");
      } else {
        throw new Error(`Erro na API: ${response.status} - ${errorData.error?.message || 'Erro desconhecido'}`);
      }
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
