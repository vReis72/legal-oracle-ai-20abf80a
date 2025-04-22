
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
  // Se o conteúdo for muito grande, fazemos um corte prévio para análise
  const contentForProcessing = fileContent.length > 15000 
    ? fileContent.substring(0, 15000) 
    : fileContent;
  
  const isBinary = isPotentiallyBinaryContent(contentForProcessing);
  
  // Conteúdo parece ser de um PDF não extraído corretamente
  if (isBinary) {
    console.log("Detectado conteúdo binário, tentando limpar");
    
    // Tenta extrair algum texto útil mesmo de PDFs com problemas
    let cleanedContent = contentForProcessing;
    
    // Remove sequências de caracteres não imprimíveis - mais agressivo
    cleanedContent = cleanedContent.replace(/[^\x20-\x7E\n\t]/g, ' ');
    
    // Remove padrões comuns de PDF que não são texto
    cleanedContent = cleanedContent.replace(/endobj|startxref|trailer|xref|obj|\d+ \d+ obj/g, ' ');
    
    // Normaliza espaços de forma mais agressiva
    cleanedContent = cleanedContent.replace(/\s+/g, ' ').trim();
    
    // Obtém uma amostra menor para análise - reduzimos para garantir processamento
    const sampleContent = cleanedContent.substring(0, 5000);
    
    // Verifica se o conteúdo está ilegível
    const isUnreadable = isContentMostlyUnreadable(sampleContent);
    
    if (isUnreadable) {
      console.log("Conteúdo considerado ilegível após tentativas de limpeza");
      
      // NOVO: Se está completamente ilegível, retornamos um conteúdo mínimo
      // para evitar problemas no processamento
      return {
        cleanContent: "Conteúdo do documento ilegível ou incompatível.",
        isBinary: true,
        isUnreadable: true,
        warning: "O conteúdo extraído do PDF está completamente ilegível. O arquivo pode ser uma digitalização sem OCR ou estar protegido."
      };
    } else {
      console.log("Conteúdo limpo com sucesso, tentando processamento");
    }
    
    return {
      cleanContent: sampleContent,
      isBinary: true,
      isUnreadable: false,
      warning: "Este documento parece ser um PDF com extração limitada de texto. A análise pode estar incompleta."
    };
  }
  
  // Se o conteúdo não parece ser binário, limitamos o tamanho para garantir processamento
  return {
    cleanContent: contentForProcessing.substring(0, 8000), // Reduzimos para 8000 caracteres
    isBinary: false,
    isUnreadable: false
  };
};
