
import { DocumentAnalysis } from './documentTypes';
import { getApiKey } from './apiKeyService';

/**
 * Envia o conteúdo do documento para análise via OpenAI API
 * @param prompt Prompt preparado para análise
 * @param isPdf Indica se o documento é um PDF
 * @returns Resultado da análise do documento
 */
export const analyzeDocumentWithAI = async (
  prompt: string,
  isPdf: boolean
): Promise<DocumentAnalysis> => {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    throw new Error('API key não fornecida');
  }

  // Aumentar timeout para 60 segundos para permitir análise mais completa
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000);

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "gpt-4o", // Usando modelo mais capaz para melhor análise
        messages: [
          {
            role: 'system',
            content: isPdf 
              ? 'Você é um assistente especializado em extrair e analisar conteúdo de PDFs, mesmo quando o texto está mal formatado ou parcialmente corrompido.'
              : 'Você é um assistente jurídico especializado que analisa documentos com precisão, sem inventar informações.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 2500,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro na resposta da API:', response.status, errorText);
      throw new Error(`Erro na API: ${response.status}`);
    }

    const data = await response.json();
    console.log('Resposta recebida da API OpenAI');
    
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      console.error('Resposta vazia da API');
      throw new Error('Resposta vazia da API');
    }

    // Melhorar extração do JSON da resposta para garantir funcionamento robusto
    try {
      // Primeiro tenta encontrar um objeto JSON completo na resposta
      let jsonMatch = content.match(/\{[\s\S]*\}/);
      
      // Se não encontrar um objeto completo, tenta extrair de bloco de código
      if (!jsonMatch) {
        jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
        if (jsonMatch) {
          jsonMatch[0] = jsonMatch[1]; // Use o conteúdo dentro do bloco de código
        }
      }

      if (!jsonMatch) {
        console.error('Formato de resposta inválido:', content);
        throw new Error('Formato de resposta inválido');
      }
      
      const analysisResult = JSON.parse(jsonMatch[0]) as DocumentAnalysis;
      
      // Garantir que todos os campos existam e tenham valores padrão
      return {
        summary: analysisResult.summary || 'Resumo não disponível.',
        highlights: Array.isArray(analysisResult.highlights) ? analysisResult.highlights : [],
        keyPoints: Array.isArray(analysisResult.keyPoints) ? analysisResult.keyPoints : [],
        content: analysisResult.content || ''
      };
    } catch (parseError) {
      console.error('Erro ao processar resposta JSON:', parseError, 'Conteúdo:', content);
      
      // Tenta recuperar pelo menos o resumo se o JSON estiver malformado
      const summaryMatch = content.match(/"summary"\s*:\s*"([^"]+)"/);
      const summary = summaryMatch ? summaryMatch[1] : 'Não foi possível extrair o resumo.';
      
      return {
        summary,
        highlights: [],
        keyPoints: [{
          title: "Problema no processamento",
          description: "Não foi possível extrair pontos principais e trechos relevantes deste documento."
        }],
        content: content.replace(/```json|```/g, '').substring(0, 10000)
      };
    }
  } catch (error) {
    if ((error as Error).name === 'AbortError') {
      console.log('Requisição abortada por timeout');
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
};
