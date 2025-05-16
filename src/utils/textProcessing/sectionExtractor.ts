
/**
 * Utilities for extracting sections from text responses
 */

/**
 * Extracts a section from the text using regex patterns
 * 
 * @param text The full text to extract from
 * @param sectionName The section name to search for
 * @returns The extracted section text or empty string
 */
export const extractSection = (text: string, sectionName: string): string => {
  // More flexible pattern that handles bold markdown and various header styles
  const pattern = new RegExp(`(?:^|\\n)\\s*(?:\\d+\\.)?\\s*${sectionName}[^\\n]*\\n+([\\s\\S]*?)(?=\\n+\\s*(?:\\d+\\.)?\\s*(?:\\*\\*)?[A-ZÀ-Ú][^\\n]*:|$)`, 'i');
  const match = text.match(pattern);
  return match ? match[1].trim() : '';
};

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
    keyPointItems = keyPointsSection
      .split(/\n\s*[-•*]\s+/)
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
  
  return keyPointItems;
};
