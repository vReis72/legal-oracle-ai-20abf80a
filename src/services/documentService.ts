
import { getApiKey } from './apiKeyService';

export interface DocumentHighlight {
  text: string;
  page: number;
  importance: 'high' | 'medium' | 'low';
}

export interface DocumentKeyPoint {
  title: string;
  description: string;
}

export interface DocumentAnalysis {
  summary: string;
  highlights: DocumentHighlight[];
  keyPoints: DocumentKeyPoint[];
  content: string;
}

/**
 * Processa um documento usando a API OpenAI
 * @param fileContent Conteúdo do arquivo em texto
 * @param fileName Nome do arquivo
 * @param fileType Tipo do documento ('parecer', 'auto-de-infracao' ou 'licenca')
 * @returns Análise do documento
 */
export const processDocument = async (
  fileContent: string,
  fileName: string,
  fileType: 'parecer' | 'auto-de-infracao' | 'licenca'
): Promise<DocumentAnalysis> => {
  try {
    const apiKey = getApiKey();
    
    if (!apiKey) {
      throw new Error('API key não fornecida');
    }

    // Criar um prompt específico para análise de documentos ambientais
    const prompt = `
      Você é um especialista em direito ambiental analisando um documento do tipo ${fileType} chamado "${fileName}". 
      
      Analise o seguinte conteúdo e forneça:
      
      1. Um resumo executivo em até 300 caracteres
      2. Até 5 trechos relevantes do documento, indicando a importância de cada um (alta, média ou baixa)
      3. Até 5 pontos principais do documento com título e descrição
      4. Uma versão melhorada e bem formatada do conteúdo original
      
      Responda no seguinte formato JSON (e somente JSON):
      
      {
        "summary": "resumo executivo aqui",
        "highlights": [
          {
            "text": "trecho relevante aqui",
            "page": 1,
            "importance": "high|medium|low"
          }
        ],
        "keyPoints": [
          {
            "title": "título do ponto principal",
            "description": "descrição do ponto principal"
          }
        ],
        "content": "conteúdo completo formatado"
      }
      
      Documento para análise:
      ${fileContent.substring(0, 5000)} // Limitando para evitar tokens excessivos
    `;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "gpt-4o", // Usando GPT-4o para melhor análise de documentos
        messages: [
          {
            role: 'system',
            content: 'Você é um assistente especializado em análise de documentos jurídicos ambientais.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2500,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Erro na API: ${response.status} - ${errorData.error?.message || 'Erro desconhecido'}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('Resposta vazia da API');
    }

    // Extrair JSON da resposta
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Formato de resposta inválido');
    }
    
    const analysisResult = JSON.parse(jsonMatch[0]) as DocumentAnalysis;
    
    // Garantir que todos os campos existam
    return {
      summary: analysisResult.summary || 'Resumo não disponível.',
      highlights: analysisResult.highlights || [],
      keyPoints: analysisResult.keyPoints || [],
      content: analysisResult.content || fileContent
    };
  } catch (error) {
    console.error('Erro ao processar documento:', error);
    throw error;
  }
};

// Função para determinar o tipo de documento com base no nome do arquivo
export const determineDocumentType = (fileName: string): 'parecer' | 'auto-de-infracao' | 'licenca' => {
  const lowerName = fileName.toLowerCase();
  
  if (lowerName.includes('parecer') || lowerName.includes('técnico') || lowerName.includes('tecnico')) {
    return 'parecer';
  } else if (
    lowerName.includes('auto') || 
    lowerName.includes('infração') || 
    lowerName.includes('infracao')
  ) {
    return 'auto-de-infracao';
  } else if (
    lowerName.includes('licença') || 
    lowerName.includes('licenca') || 
    lowerName.includes('ambiental')
  ) {
    return 'licenca';
  }
  
  // Tipo padrão se não for possível determinar
  return 'parecer';
};
