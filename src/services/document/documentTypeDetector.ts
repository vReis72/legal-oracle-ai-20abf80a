
import { DocumentType } from '../documentTypes';

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

/**
 * Determina o formato do arquivo com base na extensão
 * @param fileName Nome do arquivo
 * @returns Formato do arquivo
 */
export const determineFileFormat = (fileName: string): 'pdf' | 'txt' | 'docx' | 'doc' | 'unknown' => {
  const extension = fileName.split('.').pop()?.toLowerCase() || '';
  
  if (extension === 'pdf') {
    return 'pdf';
  } else if (extension === 'txt') {
    return 'txt';
  } else if (extension === 'docx') {
    return 'docx';
  } else if (extension === 'doc') {
    return 'doc';
  }
  
  return 'unknown';
};
