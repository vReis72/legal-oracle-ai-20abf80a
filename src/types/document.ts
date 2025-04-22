
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
  }>;
  keyPoints?: Array<{
    title: string;
    description: string;
  }>;
}
