
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
    
    // Melhor detecção de conteúdo PDF e outros formatos binários
    let cleanContent = fileContent;
    let isPotentiallyBinaryContent = false;
    
    // Verificar se é um PDF ou conteúdo binário
    if (
      fileContent.startsWith('%PDF-') || 
      fileContent.includes('endobj') || 
      fileContent.includes('stream') ||
      // Verificar presença de caracteres não-imprimíveis ou alta frequência de caracteres não-ASCII
      (/[\x00-\x08\x0E-\x1F\x7F-\xFF]/.test(fileContent.substring(0, 1000)) && 
       fileContent.substring(0, 1000).match(/[\x00-\x08\x0E-\x1F\x7F-\xFF]/g)!.length > 50)
    ) {
      isPotentiallyBinaryContent = true;
      cleanContent = "Este parece ser um arquivo PDF ou binário cuja extração de texto não foi bem-sucedida. " +
                     "Por favor, converta o documento para texto antes de carregar ou use arquivos de texto puro (.txt).";
    }
    
    // Se o conteúdo não parece ser binário, mas ainda é muito grande, limitamos
    if (!isPotentiallyBinaryContent) {
      // Aumentamos para 20000 caracteres para melhor análise em documentos de texto válidos
      cleanContent = fileContent.substring(0, 20000);
    }
    
    // Criar um prompt mais específico e claro para melhorar a análise
    const prompt = `
      Você é um assistente jurídico especializado. Analise este documento jurídico do tipo ${fileType} 
      chamado "${fileName}" e forneça:
      
      1. Um resumo preciso em até 300 caracteres que capture a essência do documento
      2. 3 trechos literais e relevantes do documento, indicando sua importância (alta, média ou baixa) 
         com base no conteúdo real. ATENÇÃO: Use apenas trechos que realmente existem no documento.
      3. 3 pontos principais do documento com título e descrição curta baseados no conteúdo real
      4. Uma versão formatada do conteúdo original (melhore a formatação, mas mantenha o conteúdo)
      
      IMPORTANTE: Trabalhe EXCLUSIVAMENTE com o conteúdo do documento. Se parecer que o arquivo 
      não foi convertido corretamente para texto (como PDF que não foi convertido), 
      indique claramente isso em sua resposta e NÃO invente conteúdo.
      
      ATENÇÃO ESPECIAL: Se você não conseguir extrair trechos relevantes ou pontos principais porque o 
      documento não está em formato adequado, retorne listas vazias para os campos "highlights" e "keyPoints" 
      e explique a situação no campo "summary".
      
      Responda no seguinte formato JSON:
      
      {
        "summary": "resumo aqui",
        "highlights": [
          {
            "text": "trecho relevante exatamente como aparece no documento",
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
      ${cleanContent}
    `;

    // Aumentar timeout para 60 segundos para permitir análise mais completa
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    console.log('Enviando requisição para API OpenAI...');

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
            content: 'Você é um assistente jurídico especializado que analisa documentos com precisão, sem inventar informações.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1, // Temperatura ainda mais baixa para maior precisão
        max_tokens: 2500, // Aumentado para permitir respostas mais completas
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
      
      // Se for um PDF ou conteúdo binário, aceitamos uma resposta vazia em alguns campos
      if (isPotentiallyBinaryContent) {
        return {
          summary: analysisResult.summary || 'Este documento parece estar em formato binário ou PDF não extraído corretamente.',
          highlights: analysisResult.highlights || [],
          keyPoints: analysisResult.keyPoints || [
            {
              title: "Erro de Formato",
              description: "O documento está em formato binário ou PDF que não pôde ser processado adequadamente."
            }
          ],
          content: analysisResult.content || cleanContent
        };
      }
      
      // Para documentos de texto, validamos mais estritamente
      // Para evitar retornos vazios quando há conteúdo real
      if (cleanContent.length > 200 && 
          (analysisResult.highlights?.length === 0 || !analysisResult.highlights) && 
          !isPotentiallyBinaryContent &&
          !cleanContent.includes("não foi bem-sucedida")) {
        console.warn('A análise retornou highlights vazios para um documento com conteúdo');
      }
      
      // Garantir que todos os campos existam e tenham valores padrão
      return {
        summary: analysisResult.summary || 'Resumo não disponível.',
        highlights: analysisResult.highlights || [],
        keyPoints: analysisResult.keyPoints || [],
        content: analysisResult.content || cleanContent
      };
    } catch (parseError) {
      console.error('Erro ao processar resposta JSON:', parseError);
      throw new Error('Erro ao processar resposta da API');
    }
  } catch (error) {
    console.error('Erro ao processar documento:', error);
    
    if ((error as Error).name === 'AbortError') {
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
    lowerName.includes('legal')
  ) {
    return 'licenca';
  }
  
  // Tipo padrão se não for possível determinar
  return 'parecer';
};
