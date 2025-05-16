
/**
 * Validates if file is supported for text extraction
 * @param file File to validate
 * @returns boolean indicating if file type is supported
 */
export const isSupportedFileType = (file: File): boolean => {
  const supportedTypes = [
    'application/pdf',
    'text/plain',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  return supportedTypes.includes(file.type);
};

/**
 * Validates extracted text content
 * @param text Extracted text to validate
 * @param fileType Type of file that was extracted
 * @returns Object with validation status and optional error message
 */
export const validateExtractedContent = (text: string, fileType: string): { valid: boolean; errorMessage?: string } => {
  if (!text || text.trim().length === 0) {
    return { 
      valid: false, 
      errorMessage: "Texto extraído está vazio" 
    };
  }
  
  // For PDFs, be more lenient with length requirements
  // as they could be scanned documents with little text
  const minLength = fileType === 'application/pdf' ? 10 : 50;
  
  if (text.trim().length < minLength) {
    return {
      valid: false,
      errorMessage: `O texto extraído é muito curto (${text.trim().length} caracteres). O documento pode ser uma digitalização ou imagem.`
    };
  }
  
  return { valid: true };
};
