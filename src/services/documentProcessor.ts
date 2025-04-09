
import { getApiKey } from './apiKeyService';
import { DocumentAnalysis, DocumentType } from './documentTypes';
import { cleanDocumentContent, createDocumentAnalysisPrompt } from './documentUtils';

/**
 * Processa um documento usando a API OpenAI
 * @param fileContent Conteúdo do arquivo em texto
 * @param fileName Nome do arquivo
 * @param fileType Tipo do documento
 * @returns Análise do documento
 */
export const processDocument = async (
  fileContent: string,
  fileName: string,
  fileType: DocumentType
): Promise<DocumentAnalysis> => {
  try {
    const apiKey = getApiKey();
    
    if (!apiKey) {
      throw new Error('API key não fornecida');
    }

    console.log(`Iniciando processamento do documento: ${fileName} (${fileContent.length} caracteres)`);
    
    // Limpar e verificar o conteúdo
    const { cleanContent, isBinary } = cleanDocumentContent(fileContent);
    
    // Se parecer um arquivo binário/PDF com problema de extração, fornecer uma análise básica
    if (isBinary) {
      console.warn('Identificado documento binário ou PDF com problemas de extração');
      return {
        summary: 'Este documento parece ser um PDF ou arquivo binário cuja extração de texto não foi bem-sucedida. Por favor, considere converter para texto puro (.txt) antes de carregar.',
        highlights: [],
        keyPoints: [
          {
            title: "Problema na Extração de Texto",
            description: "O documento parece estar em formato que dificulta a extração de texto. Para melhores resultados, considere usar arquivos de texto (.txt)."
          }
        ],
        content: "Conteúdo não disponível para visualização. Considere converter este documento para um formato de texto puro antes de fazer upload."
      };
    }
    
    // Criar prompt para a análise
    const prompt = createDocumentAnalysisPrompt(cleanContent, fileName, fileType);

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
