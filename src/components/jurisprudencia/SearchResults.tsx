
import React from 'react';
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Building, Calendar, BookOpen, GanttChart, ArrowUpDown } from 'lucide-react';
import { SearchResult } from '@/services/openaiService';

interface SearchResultsProps {
  results: SearchResult[];
  hasSearched: boolean;
  sortByRelevance: () => void;
  sortByDate: () => void;
}

const SearchResults: React.FC<SearchResultsProps> = ({ 
  results, 
  hasSearched, 
  sortByRelevance, 
  sortByDate 
}) => {
  if (!hasSearched) return null;

  return (
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
              <ResultCard key={result.id} result={result} />
            ))}
          </div>
        ) : (
          <EmptyResults />
        )}
      </ScrollArea>
    </div>
  );
};

const ResultCard: React.FC<{ result: SearchResult }> = ({ result }) => {
  return (
    <Card className="border-l-4 hover:shadow-md transition-all" style={{borderLeftColor: `rgb(45 106 79 / ${result.relevancia/100})`}}>
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
  );
};

const EmptyResults: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-40">
      <p className="text-muted-foreground">Nenhum resultado encontrado.</p>
      <p className="text-sm">Tente refinar sua busca com outros termos.</p>
    </div>
  );
};

export default SearchResults;
