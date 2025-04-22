
import { DocumentAnalysis, DocumentType } from './documentTypes';
import { cleanDocumentContent } from './documentContentCleaner';
import { createPdfAnalysisPrompt, createDocumentAnalysisPrompt } from './documentPrompts';
import { analyzeDocumentWithAI } from './documentAnalysisApi';
import { createPdfErrorAnalysis, createGenericErrorAnalysis } from './documentErrorHandler';

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
    console.log(`Iniciando processamento do documento: ${fileName} (${fileContent.length} caracteres)`);
    
    // Verificação inicial rápida - se o arquivo estiver vazio ou for muito pequeno
    if (!fileContent || fileContent.trim().length < 20) {
      console.log('Documento muito curto ou vazio');
      return createPdfErrorAnalysis("O documento está vazio ou contém muito pouco texto.");
    }
    
    // Limpar e verificar o conteúdo
    const { cleanContent, isBinary, isUnreadable, warning } = cleanDocumentContent(fileContent);
    
    // Se o documento estiver completamente ilegível, retornamos uma análise que explica o problema
    // sem tentar processá-lo com a API para evitar timeout
    if (isUnreadable) {
      console.log('Documento detectado como ilegível, retornando resposta padrão');
      return createPdfErrorAnalysis(warning || "O documento parece estar em um formato que dificulta a extração de texto.");
    }
    
    // Verificar se é um PDF com problemas de extração
    const isPdf = fileName.toLowerCase().endsWith('.pdf');
    
    // Se o conteúdo for muito pequeno após limpeza e for um PDF, provavelmente é ilegível
    if (isPdf && cleanContent.length < 50) {
      console.log('PDF com conteúdo muito curto após limpeza, provavelmente ilegível');
      return createPdfErrorAnalysis("O PDF contém muito pouco texto extraível ou está protegido.");
    }
    
    // Limite adicional para garantir que o conteúdo não é grande demais para processamento
    const contentForAnalysis = cleanContent.substring(0, 4000);
    
    console.log(`Conteúdo após limpeza: ${contentForAnalysis.length} caracteres`);
    
    // Criar prompt para a análise
    const prompt = isPdf 
      ? createPdfAnalysisPrompt(contentForAnalysis, fileName, fileType)
      : createDocumentAnalysisPrompt(contentForAnalysis, fileName, fileType);

    console.log('Enviando requisição para API OpenAI...');

    // Enviar para análise e obter resultado - com timeout para garantir que não fica preso
    try {
      const analysis = await Promise.race([
        analyzeDocumentWithAI(prompt, isPdf),
        new Promise<DocumentAnalysis>((_, reject) => 
          setTimeout(() => reject(new Error("Tempo limite da API excedido")), 30000)
        )
      ]);
      
      // Adicionar o conteúdo original se não houver na resposta
      if (!analysis.content) {
        analysis.content = contentForAnalysis.substring(0, 2000);
      }
      
      return analysis;
    } catch (error) {
      console.error("Erro na análise da API:", error);
      return isPdf ? createPdfErrorAnalysis() : createGenericErrorAnalysis(fileName, isPdf);
    }
  } catch (error) {
    console.error('Erro ao processar documento:', error);
    
    const isPdf = fileName.toLowerCase().endsWith('.pdf');
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    
    // Retornar um resultado de erro
    return createGenericErrorAnalysis(fileName, isPdf, errorMessage);
  }
};
