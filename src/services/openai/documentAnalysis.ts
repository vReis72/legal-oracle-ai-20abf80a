
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
            content: 'Você é um especialista em análise de documentos jurídicos brasileiros com anos de experiência. Seu trabalho é fornecer análises profundas, bem estruturadas e altamente relevantes, com enfoque nos aspectos mais importantes do documento.'
          },
          {
            role: 'user',
            content: `Analise o seguinte documento jurídico e forneça uma análise completa, detalhada e bem fundamentada com a seguinte estrutura:

1. RESUMO DO DOCUMENTO:
Forneça um resumo abrangente e detalhado do documento jurídico, que capture toda a essência do texto, destacando o contexto, as principais alegações, argumentos e fundamentações jurídicas. O resumo deve ser completo e ter pelo menos 3 parágrafos.

2. DESTAQUES:
Identifique no mínimo 5 pontos cruciais do documento, organizados por ordem de importância (alta, média, baixa). Cada destaque deve incluir:
- O texto exato ou paráfrase precisa do trecho importante
- Explicação detalhada de por que este ponto é relevante
- Implicações jurídicas deste destaque
- Conexão com jurisprudência ou legislação relevante, quando aplicável

3. PONTOS-CHAVE:
Apresente no mínimo 5 pontos-chave organizados por temas distintos do documento. Cada ponto deve ter:
- Título claro e informativo
- Descrição detalhada do ponto (mínimo de 3 linhas)
- Fundamentação jurídica relacionada
- Possíveis consequências ou desdobramentos deste ponto

4. CONCLUSÃO:
Forneça uma conclusão jurídica bem fundamentada sobre o documento, considerando:
- Mérito jurídico dos argumentos apresentados
- Prognóstico com base na jurisprudência atual
- Pontos fortes e fracos da argumentação
- Recomendações específicas baseadas no contexto do documento

IMPORTANTE:
- Mantenha uma análise objetiva, imparcial e tecnicamente precisa
- Cite artigos, precedentes e princípios jurídicos relevantes
- Evite generalizações e análises superficiais
- Não omita informações importantes, mesmo que controversas
- Este é um documento real que precisa de análise profissional criteriosa

DOCUMENTO PARA ANÁLISE:
${text}`
          }
        ],
        temperature: 0.1,
        max_tokens: 3000
      }),
    });

    // Check for network errors
    if (!response.ok) {
      await handleApiError(response);
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
