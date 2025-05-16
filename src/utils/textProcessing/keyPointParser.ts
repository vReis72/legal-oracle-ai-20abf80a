
/**
 * Utilities for parsing key points from text
 */

import { extractKeyPointItems } from './sectionExtractor';

/**
 * Parses a key point text into title and description
 * 
 * @param item The key point text
 * @returns Object with title and description
 */
export const parseKeyPoint = (item: string): { title: string; description: string } => {
  // Check if the item has a title:description format
  if (item.includes(':')) {
    const [title, ...descParts] = item.split(':');
    const description = descParts.join(':').trim();
    
    if (title && title.trim()) {
      return {
        title: title.trim(),
        description: description || "Sem descrição adicional"
      };
    }
  }
  
  // Try to extract first sentence as title
  const sentences = item.split(/[.!?]\s+/);
  if (sentences.length > 1) {
    const title = sentences[0].trim();
    const description = item.substring(title.length).trim().replace(/^[.!?]\s*/, '');
    
    return {
      title: title,
      description: description
    };
  }
  
  // Just use the whole thing as title if it's a single sentence
  return {
    title: item.trim(),
    description: "Sem descrição adicional"
  };
};

/**
 * Processes a section of text into structured key points
 * 
 * @param keyPointsSection Text section containing key points
 * @returns Array of objects with title and description
 */
export const processKeyPoints = (keyPointsSection: string): Array<{title: string; description: string}> => {
  if (!keyPointsSection) {
    return [];
  }
  
  const keyPointItems = extractKeyPointItems(keyPointsSection);
  
  const keyPoints = keyPointItems.map(parseKeyPoint);
  
  // Ensure titles are not too long
  return keyPoints.map(point => ({
    title: point.title.length > 100 ? point.title.substring(0, 100) + '...' : point.title,
    description: point.description
  }));
};
