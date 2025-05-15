
/**
 * Split text into manageable chunks for API processing
 * 
 * @param text Text to split
 * @param chunkSize Size of each chunk in characters
 * @returns Array of text chunks
 */
export const splitTextIntoChunks = (text: string, chunkSize: number = 7500): string[] => {
  const chunks: string[] = [];
  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.substring(i, i + chunkSize));
  }
  return chunks;
};

/**
 * Parse analysis result from OpenAI response
 * 
 * @param analysisResult Text response from OpenAI
 * @returns Parsed analysis with summary, highlights and key points
 */
export const parseAnalysisResult = (analysisResult: string) => {
  let summary = "";
  const highlights: Array<{text: string; page: number; importance: string}> = [];
  const keyPoints: Array<{title: string; description: string}> = [];
  
  // Extract summary (first section until ## or empty line)
  const parts = analysisResult.split(/(?:##|#)/);
  if (parts.length > 0) {
    summary = parts[0].trim();
  }
  
  // Look for highlights in the text
  const highlightsMatch = analysisResult.match(/(?:Destaques|Principais Destaques|Pontos Importantes):([\s\S]*?)(?=##|#|$)/i);
  if (highlightsMatch && highlightsMatch[1]) {
    const highlightsText = highlightsMatch[1].trim();
    const highlightItems = highlightsText.split(/\n-|\n•|\n\d+\./);
    
    highlightItems.forEach(item => {
      const trimmedItem = item.trim();
      if (!trimmedItem) return;
      
      let importance = "média";
      if (trimmedItem.toLowerCase().includes("alta") || trimmedItem.toLowerCase().includes("importante")) {
        importance = "alta";
      } else if (trimmedItem.toLowerCase().includes("baixa")) {
        importance = "baixa";
      }
      
      highlights.push({
        text: trimmedItem.replace(/\(.*?\)/, "").trim(),
        page: 1, // Assume page 1 since we don't have page information
        importance
      });
    });
  }
  
  // Look for key points in the text
  const keyPointsMatch = analysisResult.match(/(?:Pontos-Chave|Pontos Chave|Principais Pontos):([\s\S]*?)(?=##|#|$)/i);
  if (keyPointsMatch && keyPointsMatch[1]) {
    const keyPointsText = keyPointsMatch[1].trim();
    const keyPointItems = keyPointsText.split(/\n-|\n•|\n\d+\./);
    
    keyPointItems.forEach(item => {
      const trimmedItem = item.trim();
      if (!trimmedItem) return;
      
      const titleMatch = trimmedItem.match(/^(.*?)(?::|–|-)(.*)$/);
      if (titleMatch) {
        keyPoints.push({
          title: titleMatch[1].trim(),
          description: titleMatch[2].trim()
        });
      } else if (trimmedItem) {
        keyPoints.push({
          title: trimmedItem.split(' ').slice(0, 3).join(' ') + "...",
          description: trimmedItem
        });
      }
    });
  }
  
  // If we couldn't extract the summary, use the full text
  if (!summary && analysisResult) {
    summary = analysisResult;
  }
  
  // If we couldn't extract highlights, create at least one default highlight
  if (highlights.length === 0 && analysisResult) {
    const firstSentence = analysisResult.split('.')[0];
    if (firstSentence) {
      highlights.push({
        text: firstSentence.trim() + ".",
        page: 1,
        importance: "alta"
      });
    }
  }
  
  // If we couldn't extract key points, create at least one default key point
  if (keyPoints.length === 0 && analysisResult) {
    keyPoints.push({
      title: "Análise Jurídica",
      description: analysisResult.substring(0, 200) + "..."
    });
  }
  
  return {
    summary,
    highlights,
    keyPoints
  };
};
