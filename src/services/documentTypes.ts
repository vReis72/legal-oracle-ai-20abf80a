
/**
 * Tipos compartilhados para o processamento de documentos
 */

export interface DocumentHighlight {
  text: string;
  page: number;
  importance: 'high' | 'medium' | 'low';
}

export interface DocumentKeyPoint {
  title: string;
  description: string;
}

export interface DocumentAnalysis {
  summary: string;
  highlights: DocumentHighlight[];
  keyPoints: DocumentKeyPoint[];
  content: string;
}

export type DocumentType = 'parecer' | 'auto-de-infracao' | 'licenca';
