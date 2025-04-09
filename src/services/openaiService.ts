
import { getApiKey } from './apiKeyService';

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

// Função para construir os prompts para a API OpenAI
const buildPrompt = (query: string, isAdvanced: boolean = false) => {
  const basePrompt = `Atue como um advogado especialista em direito brasileiro, pesquisando jurisprudência relevante.
  
  Baseado na consulta do usuário: "${query}"
  
  Retorne APENAS 4 decisões judiciais relevantes em formato JSON, seguindo exatamente esta estrutura:
  [
    {
      "id": "um identificador único, como um número ou código",
      "tribunal": "sigla do tribunal (STF, STJ, TRF-1, etc.)",
      "processo": "número do processo",
      "relator": "nome do relator com título (Min., Des., etc)",
      "data": "data no formato YYYY-MM-DD",
      "ementa": "texto da ementa da decisão, resumido e com pelo menos 200 caracteres",
      "relevancia": "um número entre 0 e 100 indicando a relevância para a consulta",
      "tags": ["3 a 5 palavras-chave separadas por vírgula"]
    }
  ]
  
  Lembre-se de focar na área do direito relevante para a consulta e retornar apenas casos reais da jurisprudência brasileira. Não invente dados.`;

  return isAdvanced 
    ? `${basePrompt}\n\nEsta é uma busca avançada, então por favor seja mais específico quanto aos resultados e considere especialmente os seguintes aspectos: ${query}` 
    : basePrompt;
};

// Função para realizar a busca semântica na API OpenAI
export const searchJurisprudencia = async (
  query: string, 
  apiKey: string,
  isAdvanced: boolean = false
): Promise<SearchResult[]> => {
  try {
    // Verificar se a chave foi fornecida ou usar a armazenada
    const key = apiKey || getApiKey();
    
    if (!key) {
      throw new Error('API key não fornecida');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "gpt-4o", // Usando GPT-4o para melhores resultados
        messages: [
          {
            role: 'system',
            content: 'Você é um especialista em jurisprudência ambiental brasileira.'
          },
          {
            role: 'user',
            content: buildPrompt(query, isAdvanced)
          }
        ],
        temperature: 0.2,
        max_tokens: 2000,
        top_p: 0.9
      }),
    });

    if (!response.ok) {
      throw new Error(`Erro na API: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('Resposta vazia da API');
    }
    
    // Extrair JSON da resposta
    const jsonMatch = content.match(/\[\s*\{.*\}\s*\]/s);
    if (!jsonMatch) {
      throw new Error('Formato de resposta inválido');
    }
    
    const jsonContent = jsonMatch[0];
    const results = JSON.parse(jsonContent) as SearchResult[];
    
    return results;
  } catch (error) {
    console.error('Erro ao buscar jurisprudência:', error);
    throw error;
  }
};
