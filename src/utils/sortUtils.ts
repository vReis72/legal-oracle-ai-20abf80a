
import { SearchResult } from '@/services/openaiService';

export const sortByRelevance = (results: SearchResult[]): SearchResult[] => {
  return [...results].sort((a, b) => b.relevancia - a.relevancia);
};

export const sortByDate = (results: SearchResult[]): SearchResult[] => {
  return [...results].sort((a, b) => 
    new Date(b.data).getTime() - new Date(a.data).getTime()
  );
};
