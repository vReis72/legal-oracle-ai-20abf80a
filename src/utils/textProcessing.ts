
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
  console.log("Raw analysis result to parse:", analysisResult);

  try {
    // Extract each section using regex patterns
    const extractSection = (text: string, sectionName: string) => {
      const pattern = new RegExp(`(?:^|\\n)\\s*(?:\\d+\\.)?\\s*${sectionName}[^\\n]*\\n+([\\s\\S]*?)(?=\\n+\\s*(?:\\d+\\.)?\\s*[A-ZÀ-Ú][^\\n]*:|$)`, 'i');
      const match = text.match(pattern);
      return match ? match[1].trim() : '';
    };
    
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
      
      // Try to parse key points in different formats
      let keyPointItems: string[] = [];
      
      // Try format with bullet points or dashes
      if (keyPointsSection.includes('- ') || keyPointsSection.includes('• ')) {
        keyPointItems = keyPointsSection
          .split(/\n\s*[-•*]\s+/)
          .filter(item => item.trim().length > 0);
        console.log(`Extracted ${keyPointItems.length} key points using bullet format`);
      }
      
      // If that didn't work, try numbered items
      if (keyPointItems.length <= 1 && /\d+\.\s/.test(keyPointsSection)) {
        keyPointItems = keyPointsSection
          .split(/\n\s*\d+\.\s+/)
          .filter(item => item.trim().length > 0);
        console.log(`Extracted ${keyPointItems.length} key points using numbered format`);
      }
      
      // If still doesn't work, try paragraphs
      if (keyPointItems.length <= 1) {
        keyPointItems = keyPointsSection
          .split(/\n\n+/)
          .filter(item => item.trim().length > 0);
        console.log(`Extracted ${keyPointItems.length} key points using paragraph format`);
      }
      
      // Process each key point
      keyPointItems.forEach(item => {
        // Check if the item has a title:description format
        if (item.includes(':')) {
          const [title, ...descParts] = item.split(':');
          const description = descParts.join(':').trim();
          
          if (title && title.trim()) {
            result.keyPoints.push({
              title: title.trim(),
              description: description || "Sem descrição adicional"
            });
          }
        } else {
          // Try to extract first sentence as title
          const sentences = item.split(/[.!?]\s+/);
          if (sentences.length > 1) {
            const title = sentences[0].trim();
            const description = item.substring(title.length).trim().replace(/^[.!?]\s*/, '');
            
            result.keyPoints.push({
              title: title,
              description: description
            });
          } else {
            // Just use the whole thing as title if it's a single sentence
            result.keyPoints.push({
              title: item.trim(),
              description: "Sem descrição adicional"
            });
          }
        }
      });
      
      // Ensure titles are not too long
      result.keyPoints = result.keyPoints.map(point => ({
        title: point.title.length > 100 ? point.title.substring(0, 100) + '...' : point.title,
        description: point.description
      }));
      
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
