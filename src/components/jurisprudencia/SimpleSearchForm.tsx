
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Loader2, Search } from 'lucide-react';

interface SimpleSearchFormProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  handleSimpleSearch: (e: React.FormEvent) => Promise<void>;
  isLoading: boolean;
  isKeyConfigured: boolean;
}

const SimpleSearchForm: React.FC<SimpleSearchFormProps> = ({
  searchQuery,
  setSearchQuery,
  handleSimpleSearch,
  isLoading,
  isKeyConfigured,
}) => {
  return (
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
                disabled={!searchQuery.trim() || isLoading || !isKeyConfigured}
              >
                {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
                Buscar
              </Button>
            </div>
            
            {!isKeyConfigured && (
              <div className="text-sm text-amber-600 flex items-center mt-2">
                <AlertTriangle className="h-4 w-4 mr-1" />
                Configure sua chave API para realizar buscas semânticas
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SimpleSearchForm;
