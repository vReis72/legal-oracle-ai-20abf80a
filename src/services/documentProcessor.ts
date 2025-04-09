
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
    
    // Limpar e verificar o conteúdo
    const { cleanContent, isBinary, isUnreadable, warning } = cleanDocumentContent(fileContent);
    
    // Se o documento estiver completamente ilegível, retornamos uma análise que explica o problema
    if (isUnreadable) {
      console.error('Conteúdo do documento ilegível:', warning);
      return createPdfErrorAnalysis(warning);
    }
    
    // Verificar se é um PDF com problemas de extração
    const isPdf = fileName.toLowerCase().endsWith('.pdf');
    
    // Criar prompt para a análise
    const prompt = isPdf 
      ? createPdfAnalysisPrompt(cleanContent, fileName, fileType)
      : createDocumentAnalysisPrompt(cleanContent, fileName, fileType);

    console.log('Enviando requisição para API OpenAI...');

    // Enviar para análise e obter resultado
    const analysis = await analyzeDocumentWithAI(prompt, isPdf);
    
    // Adicionar o conteúdo original se não houver na resposta
    if (!analysis.content) {
      analysis.content = cleanContent;
    }
    
    return analysis;
    
  } catch (error) {
    console.error('Erro ao processar documento:', error);
    
    const isPdf = fileName.toLowerCase().endsWith('.pdf');
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    
    // Retornar um resultado de erro
    return createGenericErrorAnalysis(fileName, isPdf, errorMessage);
  }
};
