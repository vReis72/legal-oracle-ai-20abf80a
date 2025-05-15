
import { toast } from "sonner";

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

  console.log("Enviando conteúdo para análise OpenAI...");
  
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

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Erro na API OpenAI:", errorData);
      throw new Error(`Erro na API: ${response.status} - ${errorData.error?.message || 'Erro desconhecido'}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error("Resposta vazia da API");
    }
    
    console.log("Resposta da API OpenAI recebida com sucesso");
    return content;
  } catch (error) {
    console.error("Falha na chamada da API OpenAI:", error);
    throw error;
  }
};
