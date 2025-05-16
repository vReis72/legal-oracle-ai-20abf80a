
/**
 * Main parser for OpenAI analysis results
 */

import { extractSection } from './sectionExtractor';
import { processKeyPoints } from './keyPointParser';

/**
 * Parses the analysis result from the OpenAI API response
 * 
 * @param analysisResult Raw analysis result from OpenAI
 * @returns Structured analysis data
 */
export const parseAnalysisResult = (analysisResult: string) => {
  const result = {
    summary: "",
    keyPoints: [] as Array<{title: string; description: string}>,
    conclusion: ""
  };

  // Log the raw response for debugging
  console.log("Raw analysis result to parse:", analysisResult);

  try {
    // Extract summary section
    const summarySection = extractSection(analysisResult, 'RESUMO DO DOCUMENTO');
    if (summarySection) {
      result.summary = summarySection;
      console.log("Summary extracted successfully:", result.summary.substring(0, 100) + '...');
    } else {
      console.log("Failed to extract summary section");
    }
    
    // Extract key points section
    const keyPointsSection = extractSection(analysisResult, 'PONTOS-CHAVE') || 
                             extractSection(analysisResult, 'PONTOS CHAVE');
    
    if (keyPointsSection) {
      console.log("Key points section found:", keyPointsSection.substring(0, 100) + '...');
      result.keyPoints = processKeyPoints(keyPointsSection);
      console.log(`Successfully parsed ${result.keyPoints.length} key points`);
    } else {
      console.log("Failed to extract key points section");
    }
    
    // Extract conclusion
    const conclusionSection = extractSection(analysisResult, 'CONCLUS[ÃA]O');
    if (conclusionSection) {
      result.conclusion = conclusionSection;
      console.log("Conclusion extracted successfully:", result.conclusion.substring(0, 100) + '...');
    } else {
      console.log("Failed to extract conclusion section");
    }
    
    // Fallback if sections aren't properly identified
    if (!result.summary && !result.conclusion && result.keyPoints.length === 0) {
      console.warn("Failed to parse any sections using section headers, trying alternative approach...");
      useFallbackParsing(analysisResult, result);
    }
  } catch (error) {
    console.error("Error parsing analysis result:", error);
    // Provide minimal results even if parsing fails
    if (!result.summary) result.summary = "Falha ao analisar o documento. O formato da resposta é inesperado.";
  }

  // Final check for missing sections
  if (!result.summary) {
    result.summary = "Não foi possível extrair um resumo do documento.";
  }
  
  if (result.keyPoints.length === 0) {
    result.keyPoints.push({
      title: "Análise Insuficiente",
      description: "Não foi possível identificar pontos-chave específicos neste documento."
    });
  }
  
  if (!result.conclusion) {
    result.conclusion = "Não é possível extrair uma conclusão definitiva do documento fornecido.";
  }

  return result;
};

/**
 * Fallback parser when structured sections can't be found
 * 
 * @param analysisResult The full text to parse
 * @param result The result object to populate
 */
const useFallbackParsing = (
  analysisResult: string, 
  result: {
    summary: string;
    keyPoints: Array<{title: string; description: string}>;
    conclusion: string;
  }
) => {
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
  }
  
  console.log("After fallback parsing:", 
             `Summary: ${result.summary.length} chars, `,
             `Key points: ${result.keyPoints.length}, `,
             `Conclusion: ${result.conclusion.length} chars`);
};
