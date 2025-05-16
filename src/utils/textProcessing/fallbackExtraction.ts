
/**
 * Fallback extraction methods for when structured extraction fails
 */
import { processKeyPoints } from './keyPointParser';
import { AnalysisResult } from './analysisCore';

/**
 * Last-resort extraction method that tries to find sections by looking at text structure
 */
export function extractRawSections(text: string, result: AnalysisResult): void {
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
