
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
}
