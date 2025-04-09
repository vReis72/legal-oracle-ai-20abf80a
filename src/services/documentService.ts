
/**
 * Arquivo de barril para exportar todas as funcionalidades relacionadas a documentos
 */

// Tipos e interfaces
export * from './documentTypes';

// Funcionalidades centrais
export * from './documentTypeDetector';
export * from './documentProcessor';
export * from './documentPrompts';
export * from './documentUtils';
export * from './documentAnalysisApi';
export * from './documentErrorHandler';

// Re-exporta as funções principais para compatibilidade com código existente
import { processDocument } from './documentProcessor';
import { determineDocumentType } from './documentTypeDetector';

export { processDocument, determineDocumentType };
