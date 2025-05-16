
/**
 * Main parser for OpenAI analysis results
 */

import { extractSection } from './sectionExtractor';
import { processKeyPoints } from './keyPointParser';

/**
 * Type definition for the analysis result structure
 */
interface AnalysisResult {
  summary: string;
  keyPoints: Array<{title: string; description: string}>;
  conclusion: string;
}

/**
 * Default values for when sections can't be extracted
 */
const DEFAULT_VALUES = {
  summary: "Não foi possível extrair um resumo do documento.",
  keyPoints: [{
    title: "Análise Insuficiente",
    description: "Não foi possível identificar pontos-chave específicos neste documento."
  }],
  conclusion: "Não é possível extrair uma conclusão definitiva do documento fornecido."
};

/**
 * Creates an empty result object with default structure
 */
const createEmptyResult = (): AnalysisResult => ({
  summary: "",
  keyPoints: [],
  conclusion: ""
});

/**
 * Parses the analysis result from the OpenAI API response
 * 
 * @param analysisResult Raw analysis result from OpenAI
 * @returns Structured analysis data
 */
export const parseAnalysisResult = (analysisResult: string): AnalysisResult => {
  // Log the raw response for debugging
  console.log("Raw analysis result to parse:", analysisResult);
  
  if (!analysisResult || typeof analysisResult !== 'string') {
    console.error("Invalid analysis result provided:", analysisResult);
    return {
      summary: DEFAULT_VALUES.summary,
      keyPoints: DEFAULT_VALUES.keyPoints,
      conclusion: DEFAULT_VALUES.conclusion
    };
  }

  const result = createEmptyResult();

  try {
    // Extract and process each section
    extractAndProcessSections(analysisResult, result);
    
    // Fallback if no sections were successfully extracted
    if (isMissingAllSections(result)) {
      console.warn("Failed to parse any sections using section headers, trying alternative approach...");
      useFallbackParsing(analysisResult, result);
    }
  } catch (error) {
    handleParsingError(error, result);
  }

  // Ensure all sections have at least default values
  ensureCompleteness(result);
  
  return result;
};

/**
 * Extracts and processes all main sections from the analysis text
 */
const extractAndProcessSections = (analysisResult: string, result: AnalysisResult): void => {
  // Process summary section
  const summarySection = extractSection(analysisResult, 'RESUMO DO DOCUMENTO');
  if (summarySection) {
    result.summary = summarySection;
    console.log("Summary extracted successfully:", result.summary.substring(0, 100) + (result.summary.length > 100 ? '...' : ''));
  } else {
    console.log("Failed to extract summary section");
  }
  
  // Process key points section
  const keyPointsSection = extractSection(analysisResult, 'PONTOS-CHAVE') || 
                          extractSection(analysisResult, 'PONTOS CHAVE');
  
  if (keyPointsSection) {
    console.log("Key points section found:", keyPointsSection.substring(0, 100) + (keyPointsSection.length > 100 ? '...' : ''));
    result.keyPoints = processKeyPoints(keyPointsSection);
    console.log(`Successfully parsed ${result.keyPoints.length} key points`);
  } else {
    console.log("Failed to extract key points section");
  }
  
  // Process conclusion section
  const conclusionSection = extractSection(analysisResult, 'CONCLUS[ÃA]O');
  if (conclusionSection) {
    result.conclusion = conclusionSection;
    console.log("Conclusion extracted successfully:", result.conclusion.substring(0, 100) + (result.conclusion.length > 100 ? '...' : ''));
  } else {
    console.log("Failed to extract conclusion section");
  }
};

/**
 * Checks if all sections are missing
 */
const isMissingAllSections = (result: AnalysisResult): boolean => {
  return !result.summary && !result.conclusion && result.keyPoints.length === 0;
};

/**
 * Handles parsing errors gracefully
 */
const handleParsingError = (error: unknown, result: AnalysisResult): void => {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  console.error("Error parsing analysis result:", errorMessage);
  
  // Set a default error message for summary
  if (!result.summary) {
    result.summary = "Falha ao analisar o documento. O formato da resposta é inesperado.";
  }
};

/**
 * Ensures the result contains values for all required sections
 */
const ensureCompleteness = (result: AnalysisResult): void => {
  if (!result.summary) {
    result.summary = DEFAULT_VALUES.summary;
  }
  
  if (result.keyPoints.length === 0) {
    result.keyPoints = [...DEFAULT_VALUES.keyPoints];
  }
  
  if (!result.conclusion) {
    result.conclusion = DEFAULT_VALUES.conclusion;
  }
};

/**
 * Fallback parser when structured sections can't be found
 * 
 * @param analysisResult The full text to parse
 * @param result The result object to populate
 */
const useFallbackParsing = (
  analysisResult: string, 
  result: AnalysisResult
): void => {
  // Try to extract sections based on content patterns
  const lines = analysisResult.split('\n');
  let currentSection = '';
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (!line) continue;
    
    // Try to detect section headers
    if (line.toUpperCase().includes('RESUMO')) {
      currentSection = 'summary';
      continue;
    } else if (line.toUpperCase().includes('PONTO')) {
      currentSection = 'keyPoints';
      continue;
    } else if (line.toUpperCase().includes('CONCLUS')) {
      currentSection = 'conclusion';
      continue;
    }
    
    // Add content to the appropriate section
    addContentToSection(line, currentSection, result);
  }
  
  console.log("After fallback parsing:", 
             `Summary: ${result.summary.length} chars, `,
             `Key points: ${result.keyPoints.length}, `,
             `Conclusion: ${result.conclusion.length} chars`);
};

/**
 * Adds a line of content to the appropriate section during fallback parsing
 */
const addContentToSection = (
  line: string, 
  currentSection: string, 
  result: AnalysisResult
): void => {
  if (currentSection === 'summary') {
    result.summary += (result.summary ? '\n' : '') + line;
  } else if (currentSection === 'conclusion') {
    result.conclusion += (result.conclusion ? '\n' : '') + line;
  } else if (currentSection === 'keyPoints' && line.length > 10) {
    // Only add substantive lines as key points
    result.keyPoints.push({
      title: line.split('.')[0].trim(),
      description: line
    });
  }
};
