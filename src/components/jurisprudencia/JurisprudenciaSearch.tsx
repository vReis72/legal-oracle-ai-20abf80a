
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, BookOpen, Filter, Calendar, GanttChart, Building, ArrowUpDown, Loader2 } from 'lucide-react';

interface SearchResult {
  id: string;
  tribunal: string;
  processo: string;
  relator: string;
  data: string;
  ementa: string;
  relevancia: number;
  tags: string[];
}

// Mock data for demonstration
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

const JurisprudenciaSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [advancedQuery, setAdvancedQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSimpleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setResults(mockSearchResults);
      setIsLoading(false);
      setHasSearched(true);
    }, 1500);
  };
  
  const handleAdvancedSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call with filtering
    setTimeout(() => {
      // For demo, just filter results that contain any word from the advanced query
      const queryWords = advancedQuery.toLowerCase().split(' ');
      const filtered = mockSearchResults.filter(result => 
        queryWords.some(word => 
          result.ementa.toLowerCase().includes(word) || 
          result.tags.some(tag => tag.toLowerCase().includes(word))
        )
      );
      
      setResults(filtered.length > 0 ? filtered : mockSearchResults);
      setIsLoading(false);
      setHasSearched(true);
    }, 1500);
  };

  const sortByRelevance = () => {
    const sorted = [...results].sort((a, b) => b.relevancia - a.relevancia);
    setResults(sorted);
  };
  
  const sortByDate = () => {
    const sorted = [...results].sort((a, b) => 
      new Date(b.data).getTime() - new Date(a.data).getTime()
    );
    setResults(sorted);
  };

  return (
    <div className="flex flex-col h-full">
      <Tabs defaultValue="simples" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="simples">Busca Simples</TabsTrigger>
          <TabsTrigger value="avancada">Busca Avançada</TabsTrigger>
        </TabsList>
        
        <TabsContent value="simples">
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Busca Semântica de Jurisprudência</CardTitle>
                <CardDescription>
                  Pesquise utilizando linguagem natural para encontrar precedentes relevantes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSimpleSearch} className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Ex: responsabilidade por dano em APP causado por proprietário anterior"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Button 
                      type="submit" 
                      className="bg-eco-primary hover:bg-eco-dark"
                      disabled={!searchQuery.trim() || isLoading}
                    >
                      {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
                      Buscar
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="avancada">
          <Card>
            <CardHeader>
              <CardTitle>Busca Avançada</CardTitle>
              <CardDescription>
                Utilize parâmetros específicos para refinar sua pesquisa
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAdvancedSearch} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Palavras-chave</label>
                    <Textarea 
                      placeholder="Termos de busca separados por espaço"
                      value={advancedQuery}
                      onChange={(e) => setAdvancedQuery(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Tribunal</label>
                      <Select defaultValue="todos">
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tribunal" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todos">Todos os tribunais</SelectItem>
                          <SelectItem value="stf">STF</SelectItem>
                          <SelectItem value="stj">STJ</SelectItem>
                          <SelectItem value="trf1">TRF-1</SelectItem>
                          <SelectItem value="trf4">TRF-4</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-sm font-medium">Data Inicial</label>
                        <Input type="date" className="w-full" />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Data Final</label>
                        <Input type="date" className="w-full" />
                      </div>
                    </div>
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-eco-secondary hover:bg-eco-dark"
                  disabled={!advancedQuery.trim() || isLoading}
                >
                  {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Filter className="h-4 w-4 mr-2" />}
                  Pesquisar
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {hasSearched && (
        <div className="mt-6 flex-grow">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-serif text-lg">
              Resultados da busca
              <span className="ml-2 text-sm font-sans text-muted-foreground">
                ({results.length} encontrados)
              </span>
            </h3>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={sortByRelevance}
                className="flex items-center"
              >
                <GanttChart className="h-4 w-4 mr-1" />
                <span className="text-xs">Relevância</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={sortByDate}
                className="flex items-center"
              >
                <Calendar className="h-4 w-4 mr-1" />
                <span className="text-xs">Data</span>
              </Button>
            </div>
          </div>

          <ScrollArea className="h-[calc(100vh-26rem)] pr-4">
            {results.length > 0 ? (
              <div className="space-y-4">
                {results.map(result => (
                  <Card key={result.id} className="border-l-4 hover:shadow-md transition-all" style={{borderLeftColor: `rgb(45 106 79 / ${result.relevancia/100})`}}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between">
                        <div className="flex items-center">
                          <Building className="h-4 w-4 mr-2 text-eco-primary" />
                          <span className="font-medium">{result.tribunal}</span>
                          <span className="mx-2 text-muted-foreground">|</span>
                          <span>{result.processo}</span>
                        </div>
                        <Badge variant="outline" className="bg-eco-light">
                          {result.relevancia}% relevante
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground flex items-center">
                        <Calendar className="h-3 w-3 mr-1" /> 
                        {new Date(result.data).toLocaleDateString('pt-BR')}
                        <span className="mx-2">•</span>
                        Rel. {result.relator}
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm leading-relaxed">{result.ementa}</p>
                      <div className="mt-3 flex flex-wrap gap-1">
                        {result.tags.map(tag => (
                          <Badge key={tag} variant="secondary" className="bg-eco-muted text-eco-dark">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter className="pt-2 flex justify-end">
                      <Button variant="ghost" size="sm" className="text-eco-secondary hover:text-eco-dark hover:bg-eco-muted">
                        <BookOpen className="h-4 w-4 mr-1" />
                        Ver íntegra
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-40">
                <p className="text-muted-foreground">Nenhum resultado encontrado.</p>
                <p className="text-sm">Tente refinar sua busca com outros termos.</p>
              </div>
            )}
          </ScrollArea>
        </div>
      )}
    </div>
  );
};

export default JurisprudenciaSearch;
