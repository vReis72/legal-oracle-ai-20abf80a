
import * as pdfjsLib from 'pdfjs-dist';
import { toast } from "sonner";
import { isPdfWorkerConfigured, configurePdfWorker } from '../pdf/pdfWorkerConfig';

/**
 * Options for text extraction
 */
interface TextExtractionOptions {
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
interface TextExtractionResult {
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

/**
 * Validates if file is supported for text extraction
 * @param file File to validate
 * @returns boolean indicating if file type is supported
 */
const isSupportedFileType = (file: File): boolean => {
  const supportedTypes = [
    'application/pdf',
    'text/plain',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  return supportedTypes.includes(file.type);
};

/**
 * Creates a logger with verbose option
 * @param options Text extraction options
 * @returns Logger functions
 */
const createLogger = (options: TextExtractionOptions) => {
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

/**
 * Shows notification toast if enabled
 * @param options Text extraction options
 * @param type Toast type
 * @param message Message to show
 */
const showNotification = (options: TextExtractionOptions, type: 'info' | 'success' | 'warning' | 'error', message: string) => {
  if (options.showToasts !== false) {
    switch (type) {
      case 'info':
        toast.info(message);
        break;
      case 'success':
        toast.success(message);
        break;
      case 'warning':
        toast.warning(message);
        break;
      case 'error':
        toast.error(message);
        break;
    }
  }
};

/**
 * Extracts text from a PDF file
 * @param file PDF file
 * @param options Text extraction options
 * @returns Text extraction result
 */
const extractTextFromPDF = async (file: File, options: TextExtractionOptions = {}): Promise<TextExtractionResult> => {
  const { timeout = 30000 } = options;
  const logger = createLogger(options);
  
  logger.info(`Iniciando extração de texto do PDF: ${file.name}`);
  
  try {
    // Ensure PDF worker is configured
    if (!isPdfWorkerConfigured()) {
      logger.info("Worker não configurado, tentando configurar novamente...");
      const workerResult = configurePdfWorker({
        verbose: options.verbose,
        showToasts: options.showToasts
      });
      
      if (!workerResult.success) {
        throw new Error(`Não foi possível configurar o worker do PDF.js: ${workerResult.error}`);
      }
    }
    
    // Load file as ArrayBuffer
    logger.info("Carregando arquivo como ArrayBuffer...");
    const arrayBuffer = await file.arrayBuffer();
    logger.info(`ArrayBuffer carregado, tamanho: ${arrayBuffer.byteLength} bytes`);
    
    // Validate ArrayBuffer
    if (!arrayBuffer || arrayBuffer.byteLength === 0) {
      throw new Error("ArrayBuffer vazio ou inválido");
    }
    
    // Create PDF loading task with error handling
    logger.info("Criando tarefa de carregamento do PDF...");
    let loadingTask;
    try {
      loadingTask = pdfjsLib.getDocument({ 
        data: arrayBuffer,
        cMapUrl: 'https://unpkg.com/pdfjs-dist@latest/cmaps/',
        cMapPacked: true
      });
      logger.info("Tarefa de carregamento do PDF criada com sucesso");
    } catch (pdfError) {
      logger.error("Erro ao criar tarefa de carregamento do PDF", pdfError);
      throw new Error("Falha ao iniciar o carregamento do PDF");
    }
    
    // Wait for PDF to load with timeout
    logger.info("Aguardando carregamento do PDF...");
    const pdfDoc = await Promise.race([
      loadingTask.promise,
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error("Timeout ao carregar PDF")), timeout)
      )
    ]);
    
    logger.info(`PDF carregado com sucesso. Número de páginas: ${pdfDoc.numPages}`);
    
    // Check if PDF has pages
    if (pdfDoc.numPages <= 0) {
      throw new Error("O PDF não contém páginas");
    }
    
    // Extract text from all pages
    let fullText = '';
    for (let i = 1; i <= pdfDoc.numPages; i++) {
      logger.info(`Extraindo texto da página ${i}/${pdfDoc.numPages}...`);
      const page = await pdfDoc.getPage(i);
      const textContent = await page.getTextContent();
      
      // Validate text content
      if (!textContent || !textContent.items || !textContent.items.length) {
        logger.warn(`Página ${i}: Nenhum conteúdo de texto encontrado`);
        continue;
      }
      
      // Join text items with proper spacing
      const pageText = textContent.items
        .map((item: any) => item.str || "")
        .join(' ');
        
      fullText += pageText + '\n\n';
      
      // Log sample of extracted text
      if (pageText.length > 0 && options.verbose) {
        logger.info(`Página ${i}: extraídos ${pageText.length} caracteres`);
        logger.info(`Amostra: "${pageText.substring(0, 50)}..."`);
      } else if (pageText.length === 0) {
        logger.warn(`Página ${i}: texto extraído está vazio`);
      }
    }
    
    // Validate extracted text
    if (!fullText || fullText.trim().length === 0) {
      throw new Error("Não foi possível extrair texto do PDF. O arquivo pode estar protegido ou ser uma imagem digitalizada.");
    }
    
    logger.info(`Extração concluída. Total: ${fullText.length} caracteres`);
    
    return {
      success: true,
      text: fullText,
      source: {
        name: file.name,
        type: file.type,
        size: file.size
      }
    };
  } catch (error) {
    logger.error("Erro na extração de texto do PDF", error);
    
    // Create error message based on error type
    let errorMessage = "Erro desconhecido";
    if (error instanceof Error) {
      errorMessage = error.message;
      
      // Add specific messages for common errors
      if (errorMessage.includes("Timeout")) {
        errorMessage = "O processamento do PDF demorou muito tempo. O arquivo pode ser muito grande ou complexo.";
      } else if (errorMessage.includes("password")) {
        errorMessage = "Este PDF está protegido por senha e não pode ser processado.";
      }
    }
    
    return {
      success: false,
      error: `Falha ao extrair texto do PDF: ${errorMessage}`,
      source: {
        name: file.name,
        type: file.type,
        size: file.size
      }
    };
  }
};

/**
 * Extracts text from a plain text file
 * @param file Text file
 * @param options Text extraction options
 * @returns Text extraction result
 */
const extractTextFromTxt = async (file: File, options: TextExtractionOptions = {}): Promise<TextExtractionResult> => {
  const logger = createLogger(options);
  
  logger.info(`Extraindo texto do arquivo TXT: ${file.name}`);
  
  try {
    const text = await file.text();
    logger.info(`Texto extraído do arquivo TXT, tamanho: ${text.length} caracteres`);
    
    if (options.verbose) {
      logger.info(`Amostra: "${text.substring(0, 100)}..."`);
    }
    
    return {
      success: true,
      text,
      source: {
        name: file.name,
        type: file.type,
        size: file.size
      }
    };
  } catch (error) {
    logger.error("Erro ao ler arquivo de texto", error);
    
    return {
      success: false,
      error: "Falha ao ler o arquivo de texto",
      source: {
        name: file.name,
        type: file.type,
        size: file.size
      }
    };
  }
};

/**
 * Placeholder for DOCX text extraction (not implemented)
 * @param file DOCX file
 * @param options Text extraction options
 * @returns Text extraction result with error
 */
const extractTextFromDocx = async (file: File, options: TextExtractionOptions = {}): Promise<TextExtractionResult> => {
  const logger = createLogger(options);
  
  logger.info(`Tentativa de extração de texto de DOCX: ${file.name}`);
  showNotification(options, 'warning', "Extração de texto de arquivos DOCX ainda não implementada");
  
  return {
    success: false,
    error: "Extração de texto de DOCX não implementada",
    source: {
      name: file.name,
      type: file.type,
      size: file.size
    }
  };
};

/**
 * Extracts text from different file types
 * @param file File to extract text from (PDF, DOCX, TXT)
 * @param options Text extraction options
 * @returns Promise with extracted text or error
 */
export const extractTextFromFile = async (
  file: File, 
  options: TextExtractionOptions = { verbose: false, showToasts: true }
): Promise<string> => {
  const logger = createLogger(options);
  
  logger.info(`Iniciando extração de texto do arquivo: ${file.name} (${file.type})`);
  
  if (!isSupportedFileType(file)) {
    const errorMessage = `Formato de arquivo não suportado: ${file.type}`;
    logger.error(errorMessage);
    showNotification(options, 'error', errorMessage);
    throw new Error(errorMessage);
  }
  
  let result: TextExtractionResult;
  
  // Process file based on type
  if (file.type === 'text/plain') {
    result = await extractTextFromTxt(file, options);
  } else if (file.type === 'application/pdf') {
    result = await extractTextFromPDF(file, options);
  } else {
    // DOCX or other supported document formats
    result = await extractTextFromDocx(file, options);
  }
  
  // Handle extraction result
  if (result.success && result.text) {
    logger.info(`Extração de texto concluída com sucesso para: ${file.name}`);
    return result.text;
  } else {
    logger.error(`Falha na extração de texto: ${result.error}`);
    showNotification(options, 'error', result.error || "Erro desconhecido na extração de texto");
    throw new Error(result.error || "Falha na extração de texto");
  }
};

