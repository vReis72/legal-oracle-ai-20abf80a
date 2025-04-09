
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { SearchResult, searchJurisprudencia } from '@/services/openaiService';
import { sortByRelevance, sortByDate } from '@/utils/sortUtils';
import { useApiKey } from '@/context/ApiKeyContext';

// Mock data for fallback
const mockSearchResults: SearchResult[] = [
  {
    id: '1',
    tribunal: 'STJ',
    processo: 'REsp 1.454.281/MG',
    relator: 'Min. Herman Benjamin',
    data: '2023-09-15',
    ementa: 'DIREITO AMBIENTAL. RESPONSABILIDADE CIVIL OBJETIVA POR DANO AMBIENTAL. NEXO DE CAUSALIDADE. A responsabilidade civil por dano ambiental é objetiva, informada pela teoria do risco integral, sendo o nexo de causalidade o fator aglutinante que permite que o risco se integre na unidade do ato, sendo descabida a invocação, pela empresa responsável pelo dano ambiental, de excludentes de responsabilidade civil para afastar sua obrigação de indenizar.',
    relevancia: 95,
    tags: ['responsabilidade objetiva', 'dano ambiental', 'nexo causal']
  },
  {
    id: '2',
    tribunal: 'STF',
    processo: 'RE 654.833/AC',
    relator: 'Min. Alexandre de Moraes',
    data: '2022-04-20',
    ementa: 'CONSTITUCIONAL. DIREITO AMBIENTAL. DANOS AMBIENTAIS. IMPRESCRITIBILIDADE. É imprescritível a pretensão de reparação civil de dano ambiental. A Constituição, ao incluir entre os princípios da ordem econômica a defesa do meio ambiente (art. 170, VI), atribuiu ao bem jurídico relevante valor e impôs a atuação dos órgãos do Estado, bem como da coletividade.',
    relevancia: 87,
    tags: ['imprescritibilidade', 'reparação civil', 'constitucional']
  },
  {
    id: '3',
    tribunal: 'TRF-4',
    processo: 'ApCiv 5002685-22.2016.4.04.7005/PR',
    relator: 'Des. Fed. Cândido Alfredo',
    data: '2021-11-10',
    ementa: 'DIREITO AMBIENTAL E PROCESSUAL CIVIL. AÇÃO CIVIL PÚBLICA. ÁREA DE PRESERVAÇÃO PERMANENTE. RESPONSABILIDADE DO ADQUIRENTE. OBRIGAÇÃO PROPTER REM. A obrigação de reparar e indenizar danos ambientais adere à propriedade, como obrigação propter rem, sendo possível cobrar do proprietário atual a reparação dos danos, mesmo que não tenha sido ele o causador.',
    relevancia: 82,
    tags: ['APP', 'obrigação propter rem', 'ação civil pública']
  },
  {
    id: '4',
    tribunal: 'STJ',
    processo: 'REsp 1.198.727/MG',
    relator: 'Min. Herman Benjamin',
    data: '2022-02-05',
    ementa: 'ADMINISTRATIVO. AMBIENTAL. AÇÃO CIVIL PÚBLICA. DESMATAMENTO. DANOS CAUSADOS AO MEIO AMBIENTE. PRINCÍPIO DO POLUIDOR-PAGADOR. RESPONSABILIDADE OBJETIVA. OBRIGAÇÃO PROPTER REM. IMPRESCRITIBILIDADE. No direito brasileiro é atribuído ao poluidor obrigação de recuperar e/ou indenizar os danos causados, independentemente da análise de culpa e do fato de ter havido licenciamento pelo órgão ambiental.',
    relevancia: 78,
    tags: ['desmatamento', 'poluidor-pagador', 'licenciamento ambiental']
  }
];

export const useJurisprudencia = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [advancedQuery, setAdvancedQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { apiKey } = useApiKey();

  const handleSimpleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      if (!apiKey) {
        throw new Error('API Key não configurada');
      }

      const searchResults = await searchJurisprudencia(searchQuery, apiKey);
      setResults(searchResults);
      setHasSearched(true);
      
      toast({
        title: "Busca concluída",
        description: `${searchResults.length} resultados encontrados.`,
      });
    } catch (error) {
      console.error('Erro na busca:', error);
      setError((error as Error).message || 'Erro ao realizar a busca');
      
      // Use mock data as fallback
      setResults(mockSearchResults);
      setHasSearched(true);
      
      toast({
        variant: "destructive",
        title: "Erro na busca",
        description: `Usando resultados de demonstração. ${(error as Error).message}`,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAdvancedSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      if (!apiKey) {
        throw new Error('API Key não configurada');
      }

      const searchResults = await searchJurisprudencia(advancedQuery, apiKey, true);
      setResults(searchResults);
      setHasSearched(true);
      
      toast({
        title: "Busca avançada concluída",
        description: `${searchResults.length} resultados encontrados.`,
      });
    } catch (error) {
      console.error('Erro na busca avançada:', error);
      setError((error as Error).message || 'Erro ao realizar a busca avançada');
      
      // Use filtered mock data as fallback
      const queryWords = advancedQuery.toLowerCase().split(' ');
      const filtered = mockSearchResults.filter(result => 
        queryWords.some(word => 
          result.ementa.toLowerCase().includes(word) || 
          result.tags.some(tag => tag.toLowerCase().includes(word))
        )
      );
      
      setResults(filtered.length > 0 ? filtered : mockSearchResults);
      setHasSearched(true);
      
      toast({
        variant: "destructive",
        title: "Erro na busca avançada",
        description: `Usando resultados de demonstração. ${(error as Error).message}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSortByRelevance = () => {
    setResults(sortByRelevance(results));
  };
  
  const handleSortByDate = () => {
    setResults(sortByDate(results));
  };
  
  return {
    searchQuery,
    setSearchQuery,
    advancedQuery,
    setAdvancedQuery,
    isLoading,
    results,
    hasSearched,
    error,
    apiKey,
    handleSimpleSearch,
    handleAdvancedSearch,
    handleSortByRelevance,
    handleSortByDate
  };
};
