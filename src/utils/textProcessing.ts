
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

  // Log the raw response for debugging
  console.log("Raw analysis result to parse:", analysisResult.substring(0, 200) + "...");

  try {
    // First check if there are numbered sections
    if (analysisResult.match(/\d+\.\s+[A-Z]/)) {
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
        
        // Skip the highlights section as we removed this functionality
        
        // Key Points
        else if (section.toUpperCase().startsWith('PONTOS-CHAVE') || 
                section.toUpperCase().includes('PONTOS-CHAVE:') ||
                section.toUpperCase().includes('PONTOS CHAVE:')) {
          const content = section
            .replace(/^.*?PONTOS[-\s]CHAVE.*?:?\s*/i, '') // Replace header
            .trim();
          
          console.log("Found pontos-chave section:", content.substring(0, 150) + "...");
          
          // Try to extract key points
          // First try: Split by bullet points or dashes
          let keyPointItems = content.split(/(?:\n|^)[-•*]\s+/).filter(item => item.trim().length > 0);
          
          // If that didn't work, try splitting by lines that start with uppercase letters
          if (keyPointItems.length <= 1) {
            keyPointItems = content.split(/\n(?=[A-Z])/).filter(item => item.trim().length > 0);
          }
          
          // Process each key point
          keyPointItems.forEach(item => {
            const lines = item.split('\n');
            const title = lines[0].trim();
            const description = lines.slice(1).join('\n').trim();
            
            if (title) {
              result.keyPoints.push({
                title: title,
                description: description || title // Use title as description if none provided
              });
            }
          });
          
          // If we still don't have key points, use a simpler approach
          if (result.keyPoints.length === 0) {
            const paragraphs = content.split(/\n\n+/);
            paragraphs.forEach(paragraph => {
              if (paragraph.trim()) {
                const title = paragraph.split('.')[0].trim();
                result.keyPoints.push({
                  title: title.length > 50 ? title.substring(0, 50) + '...' : title,
                  description: paragraph.trim()
                });
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
    } else {
      // Alternative parsing if the response doesn't have numbered sections
      // Try to find sections by their headings
      
      const findSection = (text: string, sectionName: string) => {
        const pattern = new RegExp(`${sectionName}[^\\n]*\\n+([\\s\\S]*?)(?=\\n+[A-Z][^\\n]*:|$)`, 'i');
        const match = text.match(pattern);
        return match ? match[1].trim() : '';
      };
      
      // Extract summary
      result.summary = findSection(analysisResult, 'RESUMO');
      
      // Extract key points
      const keyPointsSection = findSection(analysisResult, 'PONTOS-CHAVE') || 
                              findSection(analysisResult, 'PONTOS CHAVE');
      
      if (keyPointsSection) {
        // Try to extract points by bullet points or dashes
        const points = keyPointsSection.split(/(?:\n|^)[-•*]\s+/).filter(item => item.trim().length > 0);
        
        points.forEach(point => {
          const lines = point.split('\n');
          const title = lines[0].trim();
          const description = lines.slice(1).join('\n').trim();
          
          if (title) {
            result.keyPoints.push({
              title: title,
              description: description || title
            });
          }
        });
      }
      
      // Extract conclusion
      result.conclusion = findSection(analysisResult, 'CONCLUS[ÃA]O');
    }
    
    console.log(`Parsing results: Found summary (${result.summary.length} chars), ${result.keyPoints.length} key points, conclusion (${result.conclusion.length} chars)`);
    
    // If we didn't extract any content successfully, provide a simple fallback
    if (!result.summary && !result.conclusion && result.keyPoints.length === 0) {
      // Just use the first and last paragraphs as summary and conclusion
      const paragraphs = analysisResult.split(/\n\n+/).filter(p => p.trim().length > 0);
      
      if (paragraphs.length > 0) {
        result.summary = paragraphs[0];
        
        if (paragraphs.length > 2) {
          result.conclusion = paragraphs[paragraphs.length - 1];
          
          // Use middle paragraphs as key points
          for (let i = 1; i < paragraphs.length - 1; i++) {
            const para = paragraphs[i].trim();
            if (para) {
              result.keyPoints.push({
                title: para.split('.')[0].trim(),
                description: para
              });
            }
          }
        }
      }
    }
  } catch (error) {
    console.error("Error parsing analysis result:", error);
    // Provide minimal results even if parsing fails
    if (!result.summary) result.summary = "Falha ao analisar o documento. O formato da resposta é inesperado.";
  }

  return result;
};
