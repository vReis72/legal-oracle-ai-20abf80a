
/**
 * Utilities for splitting text into manageable chunks
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
