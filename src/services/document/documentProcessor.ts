
import { DocumentAnalysis, DocumentType } from '../documentTypes';
import { processAndChunkContent } from './processAndChunkContent';
import { analyzeDocumentChunks } from './analyzeDocumentChunks';
import { combineChunkAnalysis } from './combineChunkAnalysis';
import { determineDocumentType } from './documentTypeDetector';
import type { GptModel } from '@/hooks/use-documents';

export { processAndChunkContent };
export type { ProcessingResult } from './processAndChunkContent';
export { analyzeDocumentChunks };
export { combineChunkAnalysis };

export const processDocument = async (
  fileContent: string,
  fileName: string,
  documentType: any,
  gptModel: GptModel = 'gpt-4-turbo'
): Promise<any> => {
  const isPdf = fileName.toLowerCase().endsWith('.pdf');
  const fileFormat = isPdf ? 'pdf' : 'txt';

  const { chunks } = processAndChunkContent(fileContent, fileName, fileFormat);
  const analysisResults = await analyzeDocumentChunks(chunks, fileName, documentType, gptModel);
  return combineChunkAnalysis(analysisResults);
};

export { determineDocumentType };
