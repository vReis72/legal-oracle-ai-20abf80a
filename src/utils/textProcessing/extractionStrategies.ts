
/**
 * Strategies for extracting different sections from analysis results
 */
import { extractSection } from './sectionCore';
import { processKeyPoints } from './keyPointParser';
import { AnalysisResult, LegalMetadata } from './analysisCore';

/**
 * Extracts legal metadata from the enhanced format
 */
export function extractLegalMetadata(analysisResult: string, result: AnalysisResult): void {
  const metadata: LegalMetadata = {};
  
  // Extract document type
  const typeMatch = analysisResult.match(/📂\s*\*\*Tipo de Documento:\*\*\s*([^\n]+)/i) ||
                   analysisResult.match(/Tipo de Documento:\s*([^\n]+)/i);
  if (typeMatch) {
    metadata.documentType = typeMatch[1].trim();
  }
  
  // Extract process number
  const processMatch = analysisResult.match(/🔢\s*\*\*Processo:\*\*\s*([^\n]+)/i) ||
                      analysisResult.match(/Processo:\s*([^\n]+)/i);
  if (processMatch) {
    metadata.processNumber = processMatch[1].trim();
  }
  
  // Extract court
  const courtMatch = analysisResult.match(/🏛️\s*\*\*Tribunal\/Instância:\*\*\s*([^\n]+)/i) ||
                    analysisResult.match(/Tribunal:\s*([^\n]+)/i);
  if (courtMatch) {
    metadata.court = courtMatch[1].trim();
  }
  
  // Extract judge
  const judgeMatch = analysisResult.match(/⚖️\s*\*\*Juiz\/Relator:\*\*\s*([^\n]+)/i) ||
                    analysisResult.match(/Juiz:\s*([^\n]+)/i);
  if (judgeMatch) {
    metadata.judge = judgeMatch[1].trim();
  }
  
  // Extract date
  const dateMatch = analysisResult.match(/📅\s*\*\*Data:\*\*\s*([^\n]+)/i) ||
                   analysisResult.match(/Data:\s*([^\n]+)/i);
  if (dateMatch) {
    metadata.date = dateMatch[1].trim();
  }
  
  result.legalMetadata = Object.keys(metadata).length > 0 ? metadata : undefined;
}

/**
 * Extracts the summary section using different strategies
 */
export function extractSummarySection(analysisResult: string, result: AnalysisResult): void {
  // Try enhanced legal format first
  const legalSummarySection = extractSection(analysisResult, '📋\\s*\\*\\*RESUMO JURÍDICO:\\*\\*') ||
                            extractSection(analysisResult, '\\*\\*RESUMO JURÍDICO:\\*\\*');
  
  if (legalSummarySection) {
    result.summary = legalSummarySection;
    console.log("Legal summary extracted successfully");
  } else {
    // Try original format
    const summarySection = extractSection(analysisResult, '\\*\\*RESUMO:\\*\\*') ||
                          extractSection(analysisResult, 'RESUMO');
    
    if (summarySection) {
      result.summary = summarySection;
      console.log("Summary extracted using standard format");
    } else {
      console.error("Could not extract summary with any pattern");
    }
  }
}

/**
 * Extracts key points section using different strategies
 */
export function extractKeyPointsSection(analysisResult: string, result: AnalysisResult): void {
  // Try enhanced legal format first
  const legalKeyPointsSection = extractSection(analysisResult, '🔑\\s*\\*\\*PONTOS-CHAVE:\\*\\*') ||
                               extractSection(analysisResult, '\\*\\*PONTOS-CHAVE:\\*\\*');
  
  if (legalKeyPointsSection) {
    console.log("Legal key points section found");
    result.keyPoints = processKeyPoints(legalKeyPointsSection);
    console.log(`Successfully parsed ${result.keyPoints.length} key points`);
  } else {
    // Try original formats
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
  // Try enhanced legal format first
  const legalConclusionSection = extractSection(analysisResult, '⚖️\\s*\\*\\*CONCLUSÃO\\/PARECER:\\*\\*') ||
                                extractSection(analysisResult, '\\*\\*CONCLUSÃO\\/PARECER:\\*\\*');
  
  if (legalConclusionSection) {
    result.conclusion = legalConclusionSection;
    console.log("Legal conclusion extracted successfully");
  } else {
    // Try original formats
    const altConclusionSection = extractSection(analysisResult, '\\*\\*CONCLUS[ÃA]O\\/PARECER:\\*\\*') ||
                              extractSection(analysisResult, 'CONCLUS[ÃA]O') || 
                              extractSection(analysisResult, 'PARECER');
    
    if (altConclusionSection) {
      result.conclusion = altConclusionSection;
      console.log("Conclusion extracted using alternative format");
    } else {
      console.error("Could not extract conclusion with any pattern");
    }
  }
}
