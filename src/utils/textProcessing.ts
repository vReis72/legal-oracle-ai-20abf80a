
/**
 * Split text into manageable chunks for API processing
 * 
 * @param text Text to split
 * @param chunkSize Size of each chunk in characters
 * @returns Array of text chunks
 */
export const splitTextIntoChunks = (text: string, chunkSize: number = 7500): string[] => {
  if (!text) {
    return [];
  }
  
  const chunks: string[] = [];
  
  // Handle very large documents by breaking at paragraph boundaries when possible
  if (text.length > chunkSize) {
    console.log(`Documento grande detectado (${text.length} caracteres). Dividindo em chunks...`);
    
    // Try to split on paragraph breaks for more coherent chunks
    const paragraphs = text.split(/\n{2,}/);
    let currentChunk = "";
    
    for (const paragraph of paragraphs) {
      // If adding this paragraph would exceed chunk size, save current chunk and start new one
      if (currentChunk.length + paragraph.length + 2 > chunkSize) {
        if (currentChunk.length > 0) {
          chunks.push(currentChunk);
          currentChunk = "";
        }
        
        // Handle case where a single paragraph exceeds chunk size
        if (paragraph.length > chunkSize) {
          // Split large paragraph at sentence boundaries if possible
          const sentences = paragraph.split(/(?<=[.!?])\s+/);
          let sentenceChunk = "";
          
          for (const sentence of sentences) {
            if (sentenceChunk.length + sentence.length > chunkSize) {
              chunks.push(sentenceChunk);
              sentenceChunk = sentence;
            } else {
              sentenceChunk += (sentenceChunk ? " " : "") + sentence;
            }
          }
          
          if (sentenceChunk.length > 0) {
            currentChunk = sentenceChunk;
          }
        } else {
          currentChunk = paragraph;
        }
      } else {
        currentChunk += (currentChunk ? "\n\n" : "") + paragraph;
      }
    }
    
    // Add the final chunk if not empty
    if (currentChunk.length > 0) {
      chunks.push(currentChunk);
    }
    
    console.log(`Documento dividido em ${chunks.length} chunks para processamento.`);
  } else {
    chunks.push(text);
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
  if (!analysisResult || typeof analysisResult !== 'string') {
    console.error("Formato de resposta inválido:", analysisResult);
    return {
      summary: "Não foi possível processar a análise. Formato de resposta inválido.",
      highlights: [],
      keyPoints: []
    };
  }

  console.log("Processando resposta da análise...");
  
  let summary = "";
  const highlights: Array<{text: string; page: number; importance: string}> = [];
  const keyPoints: Array<{title: string; description: string}> = [];
  
  try {
    // Extract summary (first section until ## or empty line)
    // Improve parsing logic for more reliable extraction
    const summaryMatch = analysisResult.match(/(?:^|#+ *(?:Resumo|Análise|Introdução)[^\n]*\n+)([\s\S]+?)(?=\n\s*\n|\n\s*#|$)/i);
    if (summaryMatch && summaryMatch[1]) {
      summary = summaryMatch[1].trim();
    } else {
      // Fallback: Try to get first paragraph or section
      const parts = analysisResult.split(/(?:\n\s*\n|\n\s*#)/);
      if (parts.length > 0) {
        summary = parts[0].trim();
      }
    }
    
    // Look for highlights with more flexible pattern matching
    const highlightsSection = analysisResult.match(/(?:(?:#{1,3}|) *(?:Destaques|Principais Destaques|Pontos Importantes|Principais Pontos)[^\n]*\n+)([\s\S]*?)(?=\n\s*\n|\n\s*#+|$)/i);
    
    if (highlightsSection && highlightsSection[1]) {
      const highlightsText = highlightsSection[1].trim();
      const highlightItems = highlightsText.split(/\n\s*[-•*]|\n\s*\d+\./).filter(Boolean);
      
      highlightItems.forEach(item => {
        const trimmedItem = item.trim();
        if (!trimmedItem) return;
        
        let importance = "média";
        if (/\b(?:alta|importante|crucial|essencial|relevante)\b/i.test(trimmedItem.toLowerCase())) {
          importance = "alta";
        } else if (/\b(?:baixa|menor|secundári[ao])\b/i.test(trimmedItem.toLowerCase())) {
          importance = "baixa";
        }
        
        highlights.push({
          text: trimmedItem.replace(/\([^)]*(?:alta|média|baixa)[^)]*\)/i, "").trim(),
          page: 1, // Default to page 1 since we don't have page information
          importance
        });
      });
    }
    
    // Look for key points with improved pattern matching
    const keyPointsSection = analysisResult.match(/(?:(?:#{1,3}|) *(?:Pontos[ -]Chave|Principais Pontos|Pontos Principais)[^\n]*\n+)([\s\S]*?)(?=\n\s*\n|\n\s*#+|$)/i);
    
    if (keyPointsSection && keyPointsSection[1]) {
      const keyPointsText = keyPointsSection[1].trim();
      const keyPointItems = keyPointsText.split(/\n\s*[-•*]|\n\s*\d+\./).filter(Boolean);
      
      keyPointItems.forEach(item => {
        const trimmedItem = item.trim();
        if (!trimmedItem) return;
        
        // Try to extract title and description
        const titleMatch = trimmedItem.match(/^([^:]+?)(?::|–|-)(.+)$/);
        if (titleMatch) {
          keyPoints.push({
            title: titleMatch[1].trim(),
            description: titleMatch[2].trim()
          });
        } else if (trimmedItem) {
          // Fallback: Use first few words as title
          const words = trimmedItem.split(' ');
          const title = words.length > 3 
            ? words.slice(0, 3).join(' ') + "..." 
            : trimmedItem;
          
          keyPoints.push({
            title,
            description: trimmedItem
          });
        }
      });
    }
    
    console.log(`Análise processada: ${summary.length} caracteres de resumo, ${highlights.length} destaques, ${keyPoints.length} pontos-chave`);
  } catch (error) {
    console.error("Erro ao processar resposta da análise:", error);
  }
  
  // Fallback mechanisms for empty results
  
  // If we couldn't extract the summary, use the full text
  if (!summary && analysisResult) {
    console.warn("Não foi possível extrair resumo estruturado, usando texto completo");
    summary = analysisResult;
  }
  
  // If we couldn't extract highlights, create at least one default highlight
  if (highlights.length === 0 && analysisResult) {
    console.warn("Não foi possível extrair destaques, criando destaque padrão");
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
    console.warn("Não foi possível extrair pontos-chave, criando ponto-chave padrão");
    keyPoints.push({
      title: "Análise Jurídica",
      description: analysisResult.length > 200 
        ? analysisResult.substring(0, 200) + "..."
        : analysisResult
    });
  }
  
  return {
    summary,
    highlights,
    keyPoints
  };
};
