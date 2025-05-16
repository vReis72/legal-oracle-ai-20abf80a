
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
  // Remove leading bullet point markers if present
  const cleanedItem = item.replace(/^[-•*]\s+/, '').trim();
  
  // Check if the item has a title:description format
  if (cleanedItem.includes(':')) {
    const [title, ...descParts] = cleanedItem.split(':');
    const description = descParts.join(':').trim();
    
    if (title && title.trim()) {
      return {
        title: title.trim(),
        description: description || "Sem descrição adicional"
      };
    }
  }
  
  // Try to extract first sentence as title
  const sentences = cleanedItem.split(/[.!?]\s+/);
  if (sentences.length > 1) {
    const title = sentences[0].trim();
    const description = cleanedItem.substring(title.length).trim().replace(/^[.!?]\s*/, '');
    
    return {
      title: title,
      description: description || cleanedItem // Fall back to full text if description is empty
    };
  }
  
  // If it's a single sentence with a period at the end
  if (cleanedItem.endsWith('.') || cleanedItem.endsWith('!') || cleanedItem.endsWith('?')) {
    return {
      title: cleanedItem,
      description: "Sem descrição adicional"
    };
  }
  
  // Just use the whole thing as title if it's a single sentence
  return {
    title: cleanedItem,
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
  
  // Log extracted items for debugging
  console.log("Extracted key point items:", keyPointItems.length);
  if (keyPointItems.length > 0) {
    console.log("First key point item sample:", keyPointItems[0].substring(0, 100));
  }
  
  const keyPoints = keyPointItems.map(parseKeyPoint);
  
  // Ensure titles are not too long and descriptions are meaningful
  return keyPoints.map(point => ({
    title: point.title.length > 100 ? point.title.substring(0, 100) + '...' : point.title,
    description: point.description === "Sem descrição adicional" && point.title.length < 100 ? point.title : point.description
  }));
};
