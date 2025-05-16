
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
  // Check for valid input
  if (!analysisResult || typeof analysisResult !== 'string') {
    console.error("Invalid analysis result provided:", analysisResult);
    return {
      summary: DEFAULT_VALUES.summary,
      keyPoints: DEFAULT_VALUES.keyPoints,
      conclusion: DEFAULT_VALUES.conclusion
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
    // Extract and process each section using the exact format specified in the prompt
    console.log("Attempting to extract sections from the formatted response");
    const summarySection = extractSection(analysisResult, '\\*\\*RESUMO:\\*\\*');
    
    if (summarySection) {
      result.summary = summarySection;
      console.log("Summary extracted successfully:", 
                 result.summary.substring(0, 100) + 
                 (result.summary.length > 100 ? '...' : ''));
    } else {
      console.warn("Failed to extract RESUMO section using exact format");
      // Try alternative format
      const altSummarySection = extractSection(analysisResult, 'RESUMO');
      if (altSummarySection) {
        result.summary = altSummarySection;
        console.log("Summary extracted using alternative format");
      } else {
        console.error("Could not extract summary with any pattern");
      }
    }
    
    // Process key points - using exact format from prompt
    const keyPointsSection = extractSection(analysisResult, '\\*\\*PONTOS-CHAVE:\\*\\*');
    
    if (keyPointsSection) {
      console.log("Key points section found in expected format");
      result.keyPoints = processKeyPoints(keyPointsSection);
      console.log(`Successfully parsed ${result.keyPoints.length} key points`);
    } else {
      console.warn("Failed to extract PONTOS-CHAVE section using exact format");
      // Try alternative format
      const altKeyPointsSection = extractSection(analysisResult, 'PONTOS-CHAVE') || 
                                  extractSection(analysisResult, 'PONTOS CHAVE');
      
      if (altKeyPointsSection) {
        result.keyPoints = processKeyPoints(altKeyPointsSection);
        console.log(`Parsed ${result.keyPoints.length} key points using alternative format`);
      } else {
        console.error("Could not extract key points with any pattern");
      }
    }
    
    // Process conclusion section - exact format from prompt
    const conclusionSection = extractSection(analysisResult, '\\*\\*CONCLUS[ÃA]O\\/PARECER:\\*\\*');
    
    if (conclusionSection) {
      result.conclusion = conclusionSection;
      console.log("Conclusion extracted successfully in expected format");
    } else {
      console.warn("Failed to extract CONCLUSÃO/PARECER section using exact format");
      // Try alternatives
      const altConclusionSection = extractSection(analysisResult, 'CONCLUS[ÃA]O') || 
                                  extractSection(analysisResult, 'PARECER');
      
      if (altConclusionSection) {
        result.conclusion = altConclusionSection;
        console.log("Conclusion extracted using alternative format");
      } else {
        console.error("Could not extract conclusion with any pattern");
      }
    }
    
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

/**
 * Ensures all sections have values, using defaults if needed
 */
function ensureCompleteSections(result: AnalysisResult): void {
  if (!result.summary) {
    console.warn("Using default summary value");
    result.summary = DEFAULT_VALUES.summary;
  }
  
  if (result.keyPoints.length === 0) {
    console.warn("Using default key points");
    result.keyPoints = [...DEFAULT_VALUES.keyPoints];
  }
  
  if (!result.conclusion) {
    console.warn("Using default conclusion value");
    result.conclusion = DEFAULT_VALUES.conclusion;
  }
}

/**
 * Last-resort extraction method that tries to find sections by looking at text structure
 */
function extractRawSections(text: string, result: AnalysisResult): void {
  // Split the text into paragraphs
  const paragraphs = text.split(/\n\n+/).map(p => p.trim()).filter(p => p.length > 0);
  
  console.log(`Attempting raw extraction from ${paragraphs.length} paragraphs`);
  
  // If we have at least 3 paragraphs, we might have summary, keypoints, conclusion
  if (paragraphs.length >= 3) {
    // First paragraph might be summary
    if (!result.summary) {
      result.summary = paragraphs[0];
      console.log("Extracted summary from first paragraph");
    }
    
    // Middle paragraphs might contain key points
    if (result.keyPoints.length === 0) {
      // Find paragraphs with bullet points or numbered items
      const potentialKeyPointsParagraph = paragraphs.find(p => 
        p.includes('- ') || p.includes('• ') || /\d+\.\s/.test(p));
      
      if (potentialKeyPointsParagraph) {
        result.keyPoints = processKeyPoints(potentialKeyPointsParagraph);
        console.log(`Extracted ${result.keyPoints.length} key points from middle paragraphs`);
      } else if (paragraphs.length > 2) {
        // Just use the middle paragraphs
        const middleParagraphs = paragraphs.slice(1, -1).join('\n\n');
        result.keyPoints = processKeyPoints(middleParagraphs);
        console.log(`Extracted ${result.keyPoints.length} key points from middle content`);
      }
    }
    
    // Last paragraph might be conclusion
    if (!result.conclusion && paragraphs.length >= 3) {
      result.conclusion = paragraphs[paragraphs.length - 1];
      console.log("Extracted conclusion from last paragraph");
    }
  } else if (paragraphs.length > 0) {
    // If we have just one or two paragraphs, just use them as summary
    if (!result.summary) {
      result.summary = paragraphs.join('\n\n');
      console.log("Used all content as summary due to limited paragraphs");
    }
  }
}
