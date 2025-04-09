
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
    const { cleanContent, isBinary, isUnreadable, warning } = cleanDocumentContent(fileContent);
    
    // Se o documento estiver completamente ilegível, retornamos uma análise que explica o problema
    if (isUnreadable) {
      console.error('Conteúdo do documento ilegível:', warning);
      
      return {
        summary: warning || "O conteúdo extraído do PDF está completamente ilegível e corrompido.",
        highlights: [],
        keyPoints: [
          {
            title: "PDF com problemas de extração",
            description: "O arquivo PDF pode ter sido digitalizado como imagem ou estar em um formato que não permite extração de texto."
          },
          {
            title: "Recomendações",
            description: "Tente converter o PDF para texto usando uma ferramenta de OCR ou use um arquivo que contenha texto selecionável."
          }
        ],
        content: "Conteúdo ilegível - não foi possível extrair texto processável deste documento."
      };
    }
    
    // Se parecer um arquivo binário/PDF com problema de extração, 
    // tentamos processar de qualquer forma, mas com aviso
    const isProblemPdf = isBinary && fileName.toLowerCase().endsWith('.pdf');
    
    // Para PDFs identificados como binários, ainda tentamos processar com um prompt específico
    if (isProblemPdf) {
      console.warn('PDF com possíveis problemas de extração. Tentando processar mesmo assim.');
    }
    
    // Criar prompt para a análise - adaptado para PDFs com problemas
    const prompt = isProblemPdf 
      ? createPdfAnalysisPrompt(cleanContent, fileName, fileType)
      : createDocumentAnalysisPrompt(cleanContent, fileName, fileType);

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
      
      // Se for PDF com problemas, adiciona aviso
      if (isProblemPdf && warning) {
        if (analysisResult.summary) {
          analysisResult.summary = `${analysisResult.summary}`;
        }
        if (!analysisResult.keyPoints) analysisResult.keyPoints = [];
        
        // Adiciona um keyPoint sobre qualidade da extração
        analysisResult.keyPoints.push({
          title: "Aviso sobre qualidade da análise",
          description: warning
        });
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
    
    const isPdf = fileName.toLowerCase().endsWith('.pdf');
    
    // Retornar um resultado parcial em caso de erro, com sugestões para PDFs
    return {
      summary: isPdf 
        ? 'Não foi possível analisar completamente o PDF. Talvez seja devido à forma como o texto está armazenado no arquivo.'
        : 'Não foi possível analisar o documento. Tente novamente ou use um arquivo menor.',
      highlights: [],
      keyPoints: [
        {
          title: 'Erro na Análise',
          description: isPdf 
            ? 'O PDF pode estar protegido, ser uma digitalização ou ter outro formato que dificulta a extração de texto. Tente um PDF com texto selecionável.'
            : 'Ocorreu um problema durante a análise. Verifique sua chave API e o formato do arquivo.'
        }
      ],
      content: fileContent.substring(0, 1000) + '\n\n[Documento truncado devido a erro no processamento]'
    };
  }
};

/**
 * Cria prompt específico para tentar processar PDFs com problemas
 */
const createPdfAnalysisPrompt = (
  fileContent: string,
  fileName: string,
  fileType: DocumentType
): string => {
  return `
    Você é um assistente jurídico especializado. Este documento é um PDF com possíveis problemas 
    de extração de texto, chamado "${fileName}". Faça o melhor possível para analisar baseado no 
    texto disponível - mesmo que pareça fragmentado ou incompleto:
    
    1. Um resumo do que você conseguiu entender, sendo sincero sobre as limitações
    2. Quaisquer trechos que pareçam relevantes, mesmo que incompletos
    3. Pontos principais que podem ser inferidos do conteúdo disponível
    4. Uma versão mais organizada do conteúdo disponível
    
    IMPORTANTE: NÃO INVENTE INFORMAÇÕES. Seja explícito sobre o que não está claro devido à qualidade 
    da extração de texto. Se não houver conteúdo útil suficiente, diga isso claramente com a mensagem:
    "O conteúdo extraído do PDF está completamente ilegível e corrompido, consistindo principalmente de caracteres aleatórios e sem sentido. Não há informações úteis ou compreensíveis disponíveis para análise"
    
    Responda no formato JSON igual ao padrão:
    
    {
      "summary": "resumo do que foi possível entender",
      "highlights": [
        {
          "text": "trechos relevantes que foram possíveis extrair",
          "page": 1,
          "importance": "high|medium|low"
        }
      ],
      "keyPoints": [
        {
          "title": "ponto identificado",
          "description": "descrição baseada apenas no que está visível"
        }
      ],
      "content": "conteúdo formatado da melhor forma possível"
    }
    
    Texto disponível do PDF:
    ${fileContent}
  `;
};
