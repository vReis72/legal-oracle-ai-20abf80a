
/**
 * Utilitários para validar e detectar o conteúdo de documentos
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
