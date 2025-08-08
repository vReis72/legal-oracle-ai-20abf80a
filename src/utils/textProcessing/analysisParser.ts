
/**
 * Main parser for OpenAI analysis results
 */
import { 
  AnalysisResult, 
  createEmptyResult, 
  ensureCompleteSections 
} from './analysisCore';

import { 
  extractLegalMetadata,
  extractSummarySection, 
  extractKeyPointsSection, 
  extractConclusionSection 
} from './extractionStrategies';

import { extractRawSections } from './fallbackExtraction';

/**
 * Parses the analysis result from the OpenAI API response
 * 
 * @param analysisResult Raw analysis result from OpenAI
 * @returns Structured analysis data
 */
export const parseAnalysisResult = (analysisResult: string): AnalysisResult => {
  // Check for valid input
  if (!analysisResult || typeof analysisResult !== 'string') {
    console.error("Invalid analysis result provided:", analysisResult);
    return {
      summary: "Não foi possível extrair um resumo do documento.",
      keyPoints: [{
        title: "Análise Insuficiente",
        description: "Não foi possível identificar pontos-chave específicos neste documento."
      }],
      conclusion: "Não é possível extrair uma conclusão definitiva do documento fornecido."
    };
  }

  // Log the raw response for debugging - log only a portion to avoid console clutter
  console.log("Raw analysis result to parse (sample):", 
             analysisResult.substring(0, 300) + 
             (analysisResult.length > 300 ? '...' : ''));
  console.log("Full analysis result length:", analysisResult.length);
  
  // Create the result structure
  const result = createEmptyResult();

  try {
    // Extract and process each section using different strategies
    console.log("Attempting to extract sections from the formatted response");
    
    // Extract each section using specialized extraction functions
    extractLegalMetadata(analysisResult, result);
    extractSummarySection(analysisResult, result);
    extractKeyPointsSection(analysisResult, result);
    extractConclusionSection(analysisResult, result);
    
    // If we're missing all sections, try a raw text extraction approach
    if (!result.summary && !result.conclusion && result.keyPoints.length === 0) {
      console.warn("Failed to extract any sections. Trying raw text extraction fallback...");
      extractRawSections(analysisResult, result);
    }
  } catch (error) {
    console.error("Error during analysis result parsing:", error instanceof Error ? error.message : 'Unknown error');
  }

  // Always ensure we have values in each section
  ensureCompleteSections(result);
  
  return result;
};
