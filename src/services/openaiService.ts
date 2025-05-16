
import { toast } from "sonner";

// Re-export everything from the new files
export type { SearchResult } from './openai/types';
export { analyzeWithOpenAI } from './openai/documentAnalysis';
export { searchJurisprudencia } from './openai/jurisprudenciaSearch';
