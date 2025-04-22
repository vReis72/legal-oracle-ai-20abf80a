
import { DocumentAnalysis, DocumentType } from './documentTypes';
import { extractAndChunkContent, combineChunkAnalysis } from './documentConverterService';
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
    
    // Utiliza o novo serviço de conversão para extrair e chunkar o texto
    const { chunks, isComplete, warnings, isBinary } = extractAndChunkContent(fileContent, fileName);
    
    // Se não conseguiu extrair nenhum chunk válido
    if (chunks.length === 0 || !isComplete) {
      console.log('Falha na extração de conteúdo do documento');
      return createPdfErrorAnalysis(
        warnings?.[0] || "Não foi possível extrair conteúdo legível do documento."
      );
    }
    
    const isPdf = fileName.toLowerCase().endsWith('.pdf');
    
    // Se temos apenas um chunk muito pequeno e é um PDF, provavelmente é ilegível
    if (isPdf && chunks.length === 1 && chunks[0].length < 100) {
      console.log('PDF com conteúdo muito curto após limpeza, provavelmente ilegível');
      return createPdfErrorAnalysis("O PDF contém muito pouco texto extraível ou está protegido.");
    }
    
    console.log(`Processando ${chunks.length} chunks de texto`);
    
    // Para cada chunk, cria um prompt e envia para análise
    const analysisPromises = chunks.map(async (chunk, index) => {
      const isLastChunk = index === chunks.length - 1;
      
      try {
        // Cria um prompt específico para o chunk
        const prompt = isPdf 
          ? createPdfAnalysisPrompt(chunk, `${fileName} (parte ${index + 1}/${chunks.length})`, fileType)
          : createDocumentAnalysisPrompt(chunk, `${fileName} (parte ${index + 1}/${chunks.length})`, fileType);
        
        console.log(`Enviando chunk ${index + 1}/${chunks.length} para API OpenAI...`);
        
        // Envia para análise com timeout para garantir que não fica preso
        const analysis = await Promise.race([
          analyzeDocumentWithAI(prompt, isPdf),
          new Promise<DocumentAnalysis>((_, reject) => 
            setTimeout(() => reject(new Error(`Tempo limite da API excedido para chunk ${index + 1}`)), 30000)
          )
        ]);
        
        return {
          ...analysis,
          // Guarda uma parte do conteúdo original
          content: isLastChunk ? chunk.substring(0, 2000) : undefined
        };
      } catch (error) {
        console.error(`Erro na análise do chunk ${index + 1}:`, error);
        // Retorna um objeto parcial de erro para este chunk
        return {
          summary: `[Erro na análise da parte ${index + 1}/${chunks.length}]`,
          keyPoints: [{
            title: `Erro na parte ${index + 1}`,
            description: "Esta seção do documento não pôde ser analisada."
          }],
          highlights: [],
          content: isLastChunk ? chunk.substring(0, 1000) : undefined
        };
      }
    });
    
    // Espera todas as análises terminarem
    const chunkResults = await Promise.allSettled(analysisPromises);
    
    // Filtra apenas os resultados bem-sucedidos
    const successfulResults = chunkResults
      .filter((result): result is PromiseFulfilledResult<DocumentAnalysis> => result.status === 'fulfilled')
      .map(result => result.value);
    
    // Se não há nenhum resultado bem-sucedido
    if (successfulResults.length === 0) {
      console.error('Todas as análises de chunks falharam');
      return isPdf ? createPdfErrorAnalysis() : createGenericErrorAnalysis(fileName, isPdf);
    }
    
    // Combina os resultados da análise de todos os chunks
    const combinedAnalysis = combineChunkAnalysis(successfulResults);
    
    // Adiciona advertência se houve erros em alguns chunks
    if (successfulResults.length < chunks.length) {
      const failedCount = chunks.length - successfulResults.length;
      combinedAnalysis.summary = `[Aviso: ${failedCount} parte(s) do documento não pôde(puderam) ser analisada(s)]\n\n${combinedAnalysis.summary}`;
    }
    
    // Adiciona avisos do processo de extração, se houver
    if (warnings && warnings.length > 0) {
      // Adiciona um ponto-chave sobre problemas na extração
      combinedAnalysis.keyPoints = combinedAnalysis.keyPoints || [];
      combinedAnalysis.keyPoints.push({
        title: "Aviso sobre qualidade da extração",
        description: warnings[0]
      });
    }
    
    return combinedAnalysis;
  } catch (error) {
    console.error('Erro ao processar documento:', error);
    
    const isPdf = fileName.toLowerCase().endsWith('.pdf');
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    
    // Retornar um resultado de erro
    return createGenericErrorAnalysis(fileName, isPdf, errorMessage);
  }
};
