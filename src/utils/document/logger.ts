
import { TextExtractionOptions } from './types';

/**
 * Creates a logger with verbose option
 * @param options Text extraction options
 * @returns Logger functions
 */
export const createLogger = (options: TextExtractionOptions) => {
  const { verbose = false } = options;
  
  return {
    info: (message: string) => {
      if (verbose) {
        console.log(`[Text Extraction]: ${message}`);
      }
    },
    warn: (message: string) => {
      console.warn(`[Text Extraction Warning]: ${message}`);
    },
    error: (message: string, error?: any) => {
      console.error(`[Text Extraction Error]: ${message}`, error || '');
    }
  };
};
