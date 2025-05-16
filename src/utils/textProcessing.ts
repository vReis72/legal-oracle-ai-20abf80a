/**
 * Utility functions for text processing
 */

/**
 * Splits a long text into smaller chunks of approximately equal size.
 *
 * @param text The text to split.
 * @param chunkSize The maximum size of each chunk (default: 7500 characters).
 * @returns An array of text chunks.
 */
export const splitTextIntoChunks = (text: string, chunkSize: number = 7500): string[] => {
  if (text.length <= chunkSize) {
    return [text];
  }

  const chunks: string[] = [];
  let currentIndex = 0;

  while (currentIndex < text.length) {
    let endIndex = currentIndex + chunkSize;

    if (endIndex < text.length) {
      // Try to find a sentence boundary (period, question mark, or exclamation point)
      // within a reasonable range before the chunk size limit.
      const sentenceEnd = text.substring(currentIndex, endIndex).lastIndexOf('.');
      const questionEnd = text.substring(currentIndex, endIndex).lastIndexOf('?');
      const exclamationEnd = text.substring(currentIndex, endIndex).lastIndexOf('!');
      const lastBoundary = Math.max(sentenceEnd, questionEnd, exclamationEnd);

      if (lastBoundary > currentIndex + chunkSize * 0.8) {
        endIndex = currentIndex + lastBoundary + 1; // Include the boundary character
      }
    } else {
      endIndex = text.length;
    }

    chunks.push(text.substring(currentIndex, endIndex));
    currentIndex = endIndex;
  }

  return chunks;
};

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

  // Assuming the analysis result follows the expected structure (sections with headers)
  const sections = analysisResult.split(/\d+\.\s+/);

  // Process each section
  sections.forEach(section => {
    // Summary (look for "RESUMO" section)
    if (section.toUpperCase().startsWith('RESUMO DO DOCUMENTO') || 
        section.toUpperCase().includes('RESUMO:') || 
        section.toUpperCase().includes('RESUMO DO DOCUMENTO:')) {
      // Extract everything after the header
      const content = section
        .replace(/^.*?RESUMO.*?:?\s*/i, '')
        .trim()
        .split(/\n\n\d+\./)[0] // Stop at the next numbered section if present
        .trim();
      
      if (content) result.summary = content;
    }
    
    // Skip the highlights section (we removed this functionality)
    
    // Key Points
    else if (section.toUpperCase().startsWith('PONTOS-CHAVE') || 
             section.toUpperCase().includes('PONTOS-CHAVE:') ||
             section.toUpperCase().includes('PONTOS CHAVE:')) {
      const content = section
        .replace(/^.*?PONTOS[-\s]CHAVE.*?:?\s*/i, '') // Replace header
        .trim();
      
      // Try to extract key points by looking for patterns like titles and descriptions
      const keyPointsRaw = content.split(/\n(?=[A-Z])/g);
      
      keyPointsRaw.forEach(pointRaw => {
        const lines = pointRaw.trim().split('\n');
        if (lines.length > 0) {
          const title = lines[0].replace(/^[-•*]\s*/, '').trim();
          const description = lines.slice(1).join(' ').trim();
          if (title) {
            result.keyPoints.push({
              title: title,
              description: description || 'Sem descrição disponível'
            });
          }
        }
      });
      
      // If parsing didn't work, try alternate approach using bullet points
      if (result.keyPoints.length === 0) {
        const bulletPoints = content.split(/[-•*]\s+/);
        bulletPoints.forEach(point => {
          if (point.trim()) {
            const parts = point.split(':');
            if (parts.length > 1) {
              result.keyPoints.push({
                title: parts[0].trim(),
                description: parts.slice(1).join(':').trim()
              });
            } else {
              result.keyPoints.push({
                title: point.substring(0, 50).trim() + '...',
                description: point.trim()
              });
            }
          }
        });
      }
    }
    
    // Conclusion
    else if (section.toUpperCase().startsWith('CONCLUSÃO') || 
             section.toUpperCase().includes('CONCLUSÃO:') ||
             section.toUpperCase().includes('CONCLUSAO:')) {
      const content = section
        .replace(/^.*?CONCLUS[ÃA]O.*?:?\s*/i, '')
        .trim();
      
      if (content) result.conclusion = content;
    }
  });

  return result;
};
