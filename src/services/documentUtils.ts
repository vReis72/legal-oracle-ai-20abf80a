
/**
 * Funções utilitárias para o processamento de documentos
 */

/**
 * Verifica se o conteúdo parece ser um PDF ou formato binário
 * @param fileContent Conteúdo do arquivo
 * @returns true se parecer ser um conteúdo binário
 */
export const isPotentiallyBinaryContent = (fileContent: string): boolean => {
  // Assinaturas de PDF
  if (fileContent.startsWith('%PDF-')) return true;
  
  // Termos comuns em PDFs
  const pdfTerms = ['endobj', 'startxref', 'trailer', 'xref', 'obj'];
  for (const term of pdfTerms) {
    if (fileContent.includes(term)) return true;
  }
  
  // Verifica caracteres não imprimíveis típicos de PDFs
  const nonPrintableCount = (fileContent.substring(0, 2000).match(/[\x00-\x08\x0E-\x1F\x7F-\xFF]/g) || []).length;
  if (nonPrintableCount > 30) return true;
  
  // Padrões comuns em PDFs mal extraídos
  if (fileContent.includes('\0') || fileContent.includes('\ufffd')) return true;
  
  return false;
};

/**
 * Verifica se o conteúdo parece ser texto completamente ilegível/corrompido
 * @param content Conteúdo do arquivo
 * @returns true se parecer ser ilegível
 */
export const isContentMostlyUnreadable = (content: string): boolean => {
  // Se for muito curto após limpeza, provavelmente é ilegível
  const cleanedContent = content.replace(/\s+/g, ' ').trim();
  if (cleanedContent.length < 50) return true;
  
  // Calcula a porcentagem de caracteres não imprimíveis ou estranhos
  const sample = content.substring(0, 5000);
  const nonReadableChars = (sample.match(/[\x00-\x08\x0E-\x1F\x7F-\xFF\ufffd]/g) || []).length;
  const nonReadableRatio = nonReadableChars / sample.length;
  
  // Se mais de 40% dos caracteres forem não imprimíveis, consideramos ilegível
  if (nonReadableRatio > 0.4) return true;
  
  // Verifica por palavras conhecidas em português
  const commonPortugueseWords = ["de", "a", "o", "que", "e", "do", "da", "em", "um", "para", "com", "não", "uma", "os", "no", "se", "na", "por", "mais", "as", "dos", "como", "mas", "ao", "ele", "das", "à", "seu", "sua", "ou", "quando", "muito", "nos", "já", "eu", "também", "só", "pelo", "pela", "até", "isso"];
  
  let wordsFound = 0;
  commonPortugueseWords.forEach(word => {
    // Procura por cada palavra com limites de palavra (\b)
    const regex = new RegExp(`\\b${word}\\b`, 'i');
    if (regex.test(sample)) wordsFound++;
  });
  
  // Se menos de 5 palavras comuns foram encontradas, provavelmente é ilegível
  return wordsFound < 5;
};

/**
 * Limpa e prepara o conteúdo do arquivo para análise
 * @param fileContent Conteúdo original do arquivo
 * @returns Conteúdo limpo, status binário e aviso
 */
export const cleanDocumentContent = (fileContent: string): { 
  cleanContent: string, 
  isBinary: boolean,
  isUnreadable: boolean,
  warning?: string
} => {
  const isBinary = isPotentiallyBinaryContent(fileContent);
  
  // Conteúdo parece ser de um PDF não extraído corretamente
  if (isBinary) {
    // Tenta extrair algum texto útil mesmo de PDFs com problemas
    let cleanedContent = fileContent;
    
    // Remove sequências de caracteres não imprimíveis
    cleanedContent = cleanedContent.replace(/[\x00-\x08\x0E-\x1F\x7F-\xFF]+/g, ' ');
    
    // Remove padrões comuns de PDF que não são texto
    cleanedContent = cleanedContent.replace(/endobj|startxref|trailer|xref|obj|\d+ \d+ obj/g, ' ');
    
    // Normaliza espaços
    cleanedContent = cleanedContent.replace(/\s+/g, ' ');
    
    // Obtém uma amostra maior para análise
    const sampleContent = cleanedContent.substring(0, 30000);
    
    // Verifica se o conteúdo está ilegível
    const isUnreadable = isContentMostlyUnreadable(sampleContent);
    
    return {
      cleanContent: sampleContent,
      isBinary: true,
      isUnreadable,
      warning: isUnreadable 
        ? "O conteúdo extraído do PDF está completamente ilegível e corrompido, consistindo principalmente de caracteres aleatórios e sem sentido. Não há informações úteis ou compreensíveis disponíveis para análise."
        : "Este documento parece ser um PDF com extração limitada de texto. A análise pode estar incompleta."
    };
  }
  
  // Se o conteúdo não parece ser binário, mas ainda é muito grande, limitamos
  // Aumentamos para 30000 caracteres para melhor análise em documentos de texto válidos
  return {
    cleanContent: fileContent.substring(0, 30000),
    isBinary: false,
    isUnreadable: false
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
