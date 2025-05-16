
/**
 * Options for text extraction
 */
export interface TextExtractionOptions {
  /** Whether to show detailed logs */
  verbose?: boolean;
  /** Whether to show toast notifications */
  showToasts?: boolean;
  /** Timeout in milliseconds for PDF loading (default: 30000) */
  timeout?: number;
}

/**
 * Result of text extraction
 */
export interface TextExtractionResult {
  /** Whether extraction was successful */
  success: boolean;
  /** Extracted text if successful */
  text?: string;
  /** Error message if unsuccessful */
  error?: string;
  /** Source file that was processed */
  source: {
    name: string;
    type: string;
    size: number;
  };
}
