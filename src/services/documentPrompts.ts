
/**
 * Contém os prompts de análise utilizados para processar documentos
 */

/**
 * Cria prompt específico para processar PDFs
 * @param fileContent Conteúdo do arquivo em texto
 * @param fileName Nome do arquivo
 * @param fileType Tipo do documento
 * @returns Prompt formatado para análise de PDF
 */
export const createPdfAnalysisPrompt = (
  fileContent: string,
  fileName: string,
  fileType: string
): string => {
  return `
    Você é um especialista em extrair informações úteis de PDFs, mesmo quando o texto está mal formatado. Este documento é um PDF chamado "${fileName}". Analise o conteúdo extraído do PDF, ignorando caracteres estranhos ou formatação incorreta, e extraia as informações relevantes.
    
    Instruções importantes:
    1. Ignore completamente caracteres estranhos, símbolos sem sentido ou formatação corrompida.
    2. Foque apenas nas partes legíveis e que fazem sentido no contexto jurídico/ambiental.
    3. Se conseguir identificar parágrafos ou seções coerentes, use-os para sua análise.
    4. Se o texto estiver muito corrompido, forneça apenas as informações que você conseguir extrair com certeza.
    5. NÃO INVENTE INFORMAÇÕES que não estão presentes no texto.
    
    Responda no seguinte formato JSON:
    
    {
      "summary": "Um resumo conciso do documento baseado apenas no que foi possível extrair com clareza",
      "highlights": [
        {
          "text": "trechos legíveis identificados que são relevantes",
          "importance": "high|medium|low"
        }
      ],
      "keyPoints": [
        {
          "title": "ponto chave identificado",
          "description": "descrição baseada apenas no que está legível"
        }
      ],
      "content": "o conteúdo formatado da melhor forma possível, apenas com as partes que fazem sentido"
    }
    
    Se o texto estiver completamente ilegível e não for possível extrair NENHUMA informação útil, responda apenas:
    
    {
      "summary": "O conteúdo extraído do PDF está completamente ilegível e corrompido, consistindo principalmente de caracteres aleatórios e sem sentido. Não há informações úteis ou compreensíveis disponíveis para análise",
      "highlights": [],
      "keyPoints": [],
      "content": "Conteúdo ilegível"
    }
    
    Texto extraído do PDF:
    ${fileContent}
  `;
};

/**
 * Cria prompt para análise de documentos gerais (não-PDF)
 * @param fileContent Conteúdo do arquivo em texto
 * @param fileName Nome do arquivo
 * @param fileType Tipo do documento
 * @returns Prompt formatado para análise de documento
 */
export const createDocumentAnalysisPrompt = (
  fileContent: string,
  fileName: string,
  fileType: string
): string => {
  return `
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
    ${fileContent}
  `;
};
