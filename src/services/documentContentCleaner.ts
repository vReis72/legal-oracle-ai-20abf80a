
/**
 * Utilitários para limpeza e preparação de conteúdo de documentos
 */

import { isPotentiallyBinaryContent, isContentMostlyUnreadable } from './documentContentValidator';

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
    const sampleContent = cleanedContent.substring(0, 15000); // Reduzimos o tamanho para processamento mais rápido
    
    // Verifica se o conteúdo está ilegível
    const isUnreadable = isContentMostlyUnreadable(sampleContent);
    
    return {
      cleanContent: sampleContent,
      isBinary: true,
      isUnreadable,
      warning: isUnreadable 
        ? "O conteúdo extraído do PDF está completamente ilegível. O arquivo pode ser uma digitalização sem OCR ou estar protegido."
        : "Este documento parece ser um PDF com extração limitada de texto. A análise pode estar incompleta."
    };
  }
  
  // Se o conteúdo não parece ser binário, mas ainda é muito grande, limitamos
  return {
    cleanContent: fileContent.substring(0, 15000), // Reduzimos o tamanho para processamento mais rápido
    isBinary: false,
    isUnreadable: false
  };
};
