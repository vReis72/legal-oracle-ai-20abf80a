
import { DocumentType } from './documentTypes';

/**
 * Determina o tipo de documento com base no nome do arquivo
 * @param fileName Nome do arquivo
 * @returns Tipo de documento identificado
 */
export const determineDocumentType = (fileName: string): DocumentType => {
  const lowerName = fileName.toLowerCase();
  
  if (lowerName.includes('parecer') || lowerName.includes('técnico') || lowerName.includes('tecnico')) {
    return 'parecer';
  } else if (
    lowerName.includes('auto') || 
    lowerName.includes('infração') || 
    lowerName.includes('infracao')
  ) {
    return 'auto-de-infracao';
  } else if (
    lowerName.includes('licença') || 
    lowerName.includes('licenca') || 
    lowerName.includes('legal')
  ) {
    return 'licenca';
  }
  
  // Tipo padrão se não for possível determinar
  return 'parecer';
};
