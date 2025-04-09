
import { DocumentHighlight, DocumentKeyPoint } from '@/services/documentService';

export interface Document {
  id: string;
  name: string;
  type: 'parecer' | 'auto-de-infracao' | 'licenca';
  uploadDate: Date;
  processed: boolean;
  content?: string;
  summary?: string;
  highlights?: DocumentHighlight[];
  keyPoints?: DocumentKeyPoint[];
}
