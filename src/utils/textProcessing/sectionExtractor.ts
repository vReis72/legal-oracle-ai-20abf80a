
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
  const pattern = new RegExp(`(?:^|\\n)\\s*(?:\\d+\\.)?\\s*${sectionName}[^\\n]*\\n+([\\s\\S]*?)(?=\\n+\\s*(?:\\d+\\.)?\\s*[A-ZÀ-Ú][^\\n]*:|$)`, 'i');
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
  
  return keyPointItems;
};
