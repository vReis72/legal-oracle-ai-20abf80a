
import { DocumentAnalysis, DocumentType } from '../documentTypes';
import { processAndChunkContent } from './processAndChunkContent';
import { analyzeDocumentChunks } from './analyzeDocumentChunks';
import { combineChunkAnalysis } from './combineChunkAnalysis';
import { determineDocumentType } from './documentTypeDetector';

/**
 * Re-exporta funções principais de processamento, chunking e análise.
 */
export { processAndChunkContent };
export type { ProcessingResult } from './processAndChunkContent';
export { analyzeDocumentChunks };
export { combineChunkAnalysis };

/**
 * Função compatível com código legado para processamento total
 */
export const processDocument = async (
  fileContent: string,
  fileName: string,
  documentType: any
): Promise<any> => {
  const isPdf = fileName.toLowerCase().endsWith('.pdf');
  const fileFormat = isPdf ? 'pdf' : 'txt';
  
  const { chunks } = processAndChunkContent(fileContent, fileName, fileFormat);
  const analysisResults = await analyzeDocumentChunks(chunks, fileName, documentType);
  return combineChunkAnalysis(analysisResults);
};

export { determineDocumentType };
