
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
  // This pattern will match section headers in various formats and extract content until the next section or end
  const pattern = new RegExp(`(?:^|\\n)\\s*(?:\\d+\\.)?\\s*${sectionName}[^\\n]*\\n+([\\s\\S]*?)(?=\\n+\\s*(?:\\d+\\.)?\\s*(?:\\*\\*)?[A-ZÀ-Ú][^\\n]*:|$)`, 'i');
  
  const match = text.match(pattern);
  if (match && match[1]) {
    console.log(`Section "${sectionName}" found with ${match[1].length} characters`);
    return match[1].trim();
  }
  
  // Logging for debugging
  console.log(`Section "${sectionName}" not found with primary pattern, trying backup approach`);
  
  // Backup approach: Try to find just the title and take everything until the next section
  const titlePattern = new RegExp(`(?:^|\\n)\\s*${sectionName}[^\\n]*\\n+`, 'i');
  const titleMatch = text.match(titlePattern);
  
  if (titleMatch) {
    const startIndex = titleMatch.index! + titleMatch[0].length;
    // Now find the next section title or end of text
    const nextSectionPattern = /\n\s*(?:\d+\.)?\s*(?:\*\*)?[A-ZÀ-Ú][^\n]*:\s*\n+/i;
    const nextSectionMatch = text.substring(startIndex).match(nextSectionPattern);
    
    if (nextSectionMatch) {
      const endIndex = startIndex + nextSectionMatch.index!;
      return text.substring(startIndex, endIndex).trim();
    } else {
      // If no next section, take everything until the end
      return text.substring(startIndex).trim();
    }
  }
  
  // If nothing works, return empty string
  console.log(`Section "${sectionName}" could not be extracted with any pattern`);
  return '';
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
