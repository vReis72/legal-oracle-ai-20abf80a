
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
      keyPoints: [],
      conclusion: ""
    };
  }

  console.log("Processando resposta da análise...");
  
  let summary = "";
  const highlights: Array<{text: string; page: number; importance: string; explanation?: string}> = [];
  const keyPoints: Array<{title: string; description: string; fundamento?: string}> = [];
  let conclusion = "";
  
  try {
    // Extract summary (from section labeled "RESUMO DO DOCUMENTO" or similar)
    const summaryMatch = analysisResult.match(/(?:#{1,3}|\d+\.)\s*(?:RESUMO|Resumo)(?: DO DOCUMENTO)?[^\n]*\n+([\s\S]+?)(?=\n\s*(?:#{1,3}|\d+\.\s*(?:DESTAQUES|Destaques))|\n\s*\n\s*(?:#{1,3}|\d+)|\Z)/i);
    if (summaryMatch && summaryMatch[1]) {
      summary = summaryMatch[1].trim();
    } else {
      // Fallback: Try to get first substantial paragraph
      const paragraphs = analysisResult.split(/\n\s*\n/).filter(p => p.trim().length > 100);
      if (paragraphs.length > 0) {
        summary = paragraphs[0].trim();
      }
    }
    
    // Extract highlights section
    const highlightsSection = analysisResult.match(/(?:#{1,3}|\d+\.)\s*(?:DESTAQUES|Destaques)[^\n]*\n+([\s\S]+?)(?=\n\s*(?:#{1,3}|\d+\.\s*(?:PONTOS|Pontos))|\n\s*\n\s*(?:#{1,3}|\d+)|\Z)/i);
    
    if (highlightsSection && highlightsSection[1]) {
      const highlightsText = highlightsSection[1].trim();
      
      // Try to match individual highlights with bullet points, numbers, or paragraphs
      const highlightItems = highlightsText.split(/\n\s*[-•*]|\n\s*\d+\.|\n\s*[A-Z][^:]+:/).filter(Boolean);
      
      highlightItems.forEach((item, index) => {
        const trimmedItem = item.trim();
        if (!trimmedItem) return;
        
        // Determine importance level
        let importance = "média";
        if (/\b(?:alta|important[eí]ssim[ao]|crucial|essencial|relevante)\b/i.test(trimmedItem.toLowerCase())) {
          importance = "alta";
        } else if (/\b(?:baixa|menor|secundári[ao])\b/i.test(trimmedItem.toLowerCase())) {
          importance = "baixa";
        }
        
        // Extract explanation if present
        const parts = trimmedItem.split(/[:.]\s+/);
        const text = parts[0].trim();
        const explanation = parts.length > 1 ? parts.slice(1).join(". ") : undefined;
        
        highlights.push({
          text: text || `Destaque ${index + 1}`,
          page: 1, // Default to page 1 since we don't have page information
          importance,
          explanation
        });
      });
      
      // If we couldn't extract highlights using the above method, try another approach
      if (highlights.length === 0) {
        // Split by empty lines or paragraph markers
        const paragraphs = highlightsText.split(/\n\s*\n/).filter(Boolean);
        paragraphs.forEach((paragraph, index) => {
          const importanceLevel = index === 0 ? "alta" : 
                                 index < paragraphs.length / 2 ? "média" : "baixa";
          highlights.push({
            text: paragraph.substring(0, 100).trim() + (paragraph.length > 100 ? "..." : ""),
            page: 1,
            importance: importanceLevel,
            explanation: paragraph.length > 100 ? paragraph : undefined
          });
        });
      }
    }
    
    // Extract key points section
    const keyPointsSection = analysisResult.match(/(?:#{1,3}|\d+\.)\s*(?:PONTOS|Pontos)[-\s](?:CHAVE|Chave)[^\n]*\n+([\s\S]+?)(?=\n\s*(?:#{1,3}|\d+\.\s*(?:CONCLUS[AÃ]O|Conclus[aã]o))|\n\s*\n\s*(?:#{1,3}|\d+)|\Z)/i);
    
    if (keyPointsSection && keyPointsSection[1]) {
      const keyPointsText = keyPointsSection[1].trim();
      
      // Try to match structured key points (Title: Description)
      const keyPointItems = keyPointsText.split(/\n\s*[-•*]|\n\s*\d+\.|\n\s*[A-Z][^:]+:/).filter(Boolean);
      
      keyPointItems.forEach(item => {
        const trimmedItem = item.trim();
        if (!trimmedItem) return;
        
        // Try to extract title and description
        const titleMatch = trimmedItem.match(/^([^:]+?)(?::|–|-)(.+)$/s);
        if (titleMatch) {
          const description = titleMatch[2].trim();
          const parts = description.split(/\n\s*Fundamentação:|\n\s*Fundamento:/i);
          
          keyPoints.push({
            title: titleMatch[1].trim(),
            description: parts[0].trim(),
            fundamento: parts.length > 1 ? parts[1].trim() : undefined
          });
        } else if (trimmedItem) {
          // Fallback: Use first sentence as title
          const sentences = trimmedItem.split(/(?<=[.!?])\s+/);
          const title = sentences.length > 0 ? sentences[0] : "Ponto-chave";
          const description = sentences.length > 1 ? sentences.slice(1).join(" ") : trimmedItem;
          
          keyPoints.push({
            title,
            description
          });
        }
      });
    }
    
    // Extract conclusion section
    const conclusionMatch = analysisResult.match(/(?:#{1,3}|\d+\.)\s*(?:CONCLUS[AÃ]O|Conclus[aã]o)[^\n]*\n+([\s\S]+?)(?=\n\s*(?:#{1,3})|\Z)/i);
    if (conclusionMatch && conclusionMatch[1]) {
      conclusion = conclusionMatch[1].trim();
    } else {
      // Fallback: Try to get last substantial paragraph
      const paragraphs = analysisResult.split(/\n\s*\n/).filter(Boolean);
      if (paragraphs.length > 0) {
        conclusion = paragraphs[paragraphs.length - 1].trim();
      }
    }
    
    console.log(`Análise processada: ${summary.length} caracteres de resumo, ${highlights.length} destaques, ${keyPoints.length} pontos-chave, ${conclusion.length} caracteres de conclusão`);
  } catch (error) {
    console.error("Erro ao processar resposta da análise:", error);
  }
  
  // Ensure we have reasonable defaults for all sections
  
  if (!summary && analysisResult) {
    summary = "O sistema não conseguiu extrair um resumo estruturado da análise. Revise o documento ou tente novamente.";
    // Try to extract first paragraph as fallback
    const firstParagraph = analysisResult.split(/\n\s*\n/)[0];
    if (firstParagraph && firstParagraph.length > 50) {
      summary = firstParagraph.trim();
    }
  }
  
  if (highlights.length === 0 && analysisResult) {
    // Create at least one default highlight from each major section
    const sections = analysisResult.split(/(?:#{1,3}|\d+\.)\s*[A-Z]/);
    if (sections.length > 1) {
      sections.slice(1).forEach((section, index) => {
        const firstSentence = section.split(/(?<=[.!?])\s+/)[0];
        if (firstSentence) {
          highlights.push({
            text: firstSentence.trim(),
            page: 1,
            importance: index === 0 ? "alta" : "média",
            explanation: section.length > 100 ? section.substring(0, 100).trim() + "..." : section
          });
        }
      });
    } else {
      highlights.push({
        text: "O documento requer análise jurídica mais detalhada.",
        page: 1,
        importance: "alta"
      });
    }
  }
  
  if (keyPoints.length === 0 && analysisResult) {
    // Create key points from the document's structure
    const sentences = analysisResult.split(/(?<=[.!?])\s+/).filter(s => s.length > 30);
    
    for (let i = 0; i < Math.min(5, sentences.length); i++) {
      const sentence = sentences[i];
      keyPoints.push({
        title: `Ponto ${i+1}: ${sentence.substring(0, 30)}...`,
        description: sentence
      });
    }
    
    if (keyPoints.length === 0) {
      keyPoints.push({
        title: "Análise Jurídica Necessária",
        description: "Este documento requer uma análise jurídica mais aprofundada para identificar pontos-chave específicos."
      });
    }
  }
  
  if (!conclusion && analysisResult) {
    conclusion = "Não foi possível extrair uma conclusão estruturada. Recomenda-se uma revisão adicional do documento.";
    
    // Try to use last paragraph as conclusion
    const paragraphs = analysisResult.split(/\n\s*\n/).filter(p => p.length > 50);
    if (paragraphs.length > 0) {
      conclusion = paragraphs[paragraphs.length - 1].trim();
    }
  }
  
  return {
    summary,
    highlights,
    keyPoints,
    conclusion
  };
};
