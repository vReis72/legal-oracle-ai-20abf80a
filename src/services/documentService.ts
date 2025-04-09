
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

    console.log(`Iniciando processamento do documento: ${fileName} (${fileContent.length} caracteres)`);
    
    // Limitar o conteúdo para evitar problemas com tokens excessivos
    // Aumentado para 5000 caracteres para melhor análise
    const limitedContent = fileContent.substring(0, 5000);

    // Criar um prompt mais simples para reduzir o tempo de processamento
    const prompt = `
      Analise este documento ambiental do tipo ${fileType} chamado "${fileName}" e forneça:
      
      1. Um resumo em até 300 caracteres
      2. 3 trechos relevantes do documento, indicando sua importância (alta, média ou baixa)
      3. 3 pontos principais do documento com título e descrição curta
      4. Uma versão formatada do conteúdo original
      
      Responda no seguinte formato JSON:
      
      {
        "summary": "resumo aqui",
        "highlights": [
          {
            "text": "trecho relevante",
            "page": 1,
            "importance": "high|medium|low"
          }
        ],
        "keyPoints": [
          {
            "title": "título",
            "description": "descrição"
          }
        ],
        "content": "conteúdo formatado"
      }
      
      Documento:
      ${limitedContent}
    `;

    // Adicionar timeout reduzido para 20 segundos
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    console.log('Enviando requisição para API OpenAI...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // Usando modelo mais rápido
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1000, // Reduzido para garantir resposta mais rápida
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

    // Extrair JSON da resposta com tratamento de erros mais robusto
    try {
      // Tenta encontrar um objeto JSON na resposta
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('Formato de resposta inválido:', content);
        throw new Error('Formato de resposta inválido');
      }
      
      const analysisResult = JSON.parse(jsonMatch[0]) as DocumentAnalysis;
      
      // Garantir que todos os campos existam e tenham valores padrão
      return {
        summary: analysisResult.summary || 'Resumo não disponível.',
        highlights: analysisResult.highlights || [],
        keyPoints: analysisResult.keyPoints || [],
        content: analysisResult.content || fileContent.substring(0, 1000)
      };
    } catch (parseError) {
      console.error('Erro ao processar resposta JSON:', parseError);
      throw new Error('Erro ao processar resposta da API');
    }
  } catch (error) {
    console.error('Erro ao processar documento:', error);
    
    if (error.name === 'AbortError') {
      console.log('Requisição abortada por timeout');
    }
    
    // Retornar um resultado parcial em caso de erro
    return {
      summary: 'Não foi possível analisar o documento. Tente novamente ou use um arquivo menor.',
      highlights: [],
      keyPoints: [
        {
          title: 'Erro na Análise',
          description: 'Ocorreu um problema durante a análise. Verifique sua chave API e o formato do arquivo.'
        }
      ],
      content: fileContent.substring(0, 500) + '\n\n[Documento truncado devido a erro no processamento]'
    };
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
