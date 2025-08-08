
export interface Document {
  id: string;
  name: string;
  type: string;
  uploadDate: Date;
  processed: boolean;
  content?: string;
  summary?: string;
  highlights?: Array<{
    text: string;
    page: number;
    importance: string;
    explanation?: string;
  }>;
  keyPoints?: Array<{
    title: string;
    description: string;
    fundamento?: string;
  }>;
  conclusion?: string;
  // Enhanced legal metadata
  legalMetadata?: {
    documentType?: string;
    processNumber?: string;
    court?: string;
    judge?: string;
    date?: string;
    parties?: Array<{name: string; role: string}>;
    lawyers?: string[];
  };
}
