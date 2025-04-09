
/**
 * Funções utilitárias para o processamento de documentos
 */

/**
 * Verifica se o conteúdo parece ser um PDF ou formato binário
 * @param fileContent Conteúdo do arquivo
 * @returns true se parecer ser um conteúdo binário
 */
export const isPotentiallyBinaryContent = (fileContent: string): boolean => {
  return (
    fileContent.startsWith('%PDF-') || 
    fileContent.includes('endobj') || 
    fileContent.includes('stream') ||
    // Verificar presença de caracteres não-imprimíveis ou alta frequência de caracteres não-ASCII
    (/[\x00-\x08\x0E-\x1F\x7F-\xFF]/.test(fileContent.substring(0, 1000)) && 
     fileContent.substring(0, 1000).match(/[\x00-\x08\x0E-\x1F\x7F-\xFF]/g)!.length > 50)
  );
};

/**
 * Limpa e prepara o conteúdo do arquivo para análise
 * @param fileContent Conteúdo original do arquivo
 * @returns Conteúdo limpo e mensagem sobre problemas identificados
 */
export const cleanDocumentContent = (fileContent: string): { 
  cleanContent: string, 
  isBinary: boolean 
} => {
  const isBinary = isPotentiallyBinaryContent(fileContent);
  
  if (isBinary) {
    return {
      cleanContent: "Este parece ser um arquivo PDF ou binário cuja extração de texto não foi bem-sucedida. " +
                    "Por favor, converta o documento para texto antes de carregar ou use arquivos de texto puro (.txt).",
      isBinary: true
    };
  }
  
  // Se o conteúdo não parece ser binário, mas ainda é muito grande, limitamos
  // Aumentamos para 20000 caracteres para melhor análise em documentos de texto válidos
  return {
    cleanContent: fileContent.substring(0, 20000),
    isBinary: false
  };
};

/**
 * Cria o prompt para a análise de documento
 * @param fileContent Conteúdo do documento
 * @param fileName Nome do arquivo
 * @param fileType Tipo do documento
 * @returns Prompt para a API OpenAI
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
