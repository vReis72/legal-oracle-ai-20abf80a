
/**
 * Arquivo de barril para exportar todas as funcionalidades relacionadas a documentos
 */

export * from './documentTypes';
export * from './documentTypeDetector';
export * from './documentProcessor';

// Re-exporta as funções principais para compatibilidade com código existente
import { processDocument } from './documentProcessor';
import { determineDocumentType } from './documentTypeDetector';

export { processDocument, determineDocumentType };
