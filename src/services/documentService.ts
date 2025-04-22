
/**
 * Arquivo de barril para exportar todas as funcionalidades relacionadas a documentos
 */

// Tipos e interfaces
export * from './documentTypes';

// Funcionalidades centrais
export * from './document/documentTypeDetector';
export * from './document/documentProcessor';
export * from './documentAnalysisApi';

// Re-exporta as funções principais para compatibilidade com código existente
import { determineDocumentType } from './document/documentTypeDetector';
import { processAndChunkContent, analyzeDocumentChunks, combineChunkAnalysis } from './document/documentProcessor';

// Função de processamento do documento para manter compatibilidade com código existente
export const processDocument = async (fileContent: string, fileName: string, documentType: any): Promise<any> => {
  const isPdf = fileName.toLowerCase().endsWith('.pdf');
  const fileFormat = isPdf ? 'pdf' : 'txt';
  
  const { chunks } = processAndChunkContent(fileContent, fileName, fileFormat);
  const analysisResults = await analyzeDocumentChunks(chunks, fileName, documentType);
  return combineChunkAnalysis(analysisResults);
};

export { determineDocumentType };
