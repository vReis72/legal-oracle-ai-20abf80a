
/**
 * Utilities for extracting key point items from text sections
 */

/**
 * Extracts key points items from a text section
 * 
 * @param keyPointsSection The text section containing key points
 * @returns Array of extracted key point items
 */
export const extractKeyPointItems = (keyPointsSection: string): string[] => {
  let keyPointItems: string[] = [];
  
  // First try bullet points format (most common in the new format)
  if (keyPointsSection.includes('- ') || keyPointsSection.includes('• ')) {
    // Split by bullet points but preserve the bullet markers for better parsing
    const bulletPointPattern = /\n\s*[-•*]\s+/;
    keyPointItems = keyPointsSection
      .split(bulletPointPattern)
      .filter(item => item.trim().length > 0);
    
    // If the first item doesn't start with bullet but contains items that do,
    // we may need to clean it up
    if (keyPointItems.length > 0 && !keyPointsSection.trim().startsWith('-') && 
        !keyPointsSection.trim().startsWith('•')) {
      keyPointItems.shift(); // Remove the first item which is likely a header
    }
    
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
  
  // Add formatting to every item for consistency
  keyPointItems = keyPointItems.map(item => item.trim());
  
  return keyPointItems;
};
