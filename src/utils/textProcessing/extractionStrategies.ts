
/**
 * Strategies for extracting different sections from analysis results
 */
import { extractSection } from './sectionExtractor';
import { processKeyPoints } from './keyPointParser';
import { AnalysisResult } from './analysisCore';

/**
 * Extracts the summary section using different strategies
 */
export function extractSummarySection(analysisResult: string, result: AnalysisResult): void {
  // Try exact format first
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
}

/**
 * Extracts key points section using different strategies
 */
export function extractKeyPointsSection(analysisResult: string, result: AnalysisResult): void {
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
}

/**
 * Extracts conclusion section using different strategies
 */
export function extractConclusionSection(analysisResult: string, result: AnalysisResult): void {
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
}
