
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Filter, Loader2 } from 'lucide-react';

interface AdvancedSearchFormProps {
  advancedQuery: string;
  setAdvancedQuery: (query: string) => void;
  handleAdvancedSearch: (e: React.FormEvent) => Promise<void>;
  isLoading: boolean;
  apiKey: string | null;
}

const AdvancedSearchForm: React.FC<AdvancedSearchFormProps> = ({
  advancedQuery,
  setAdvancedQuery,
  handleAdvancedSearch,
  isLoading,
  apiKey,
}) => {
  return (
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
            disabled={!advancedQuery.trim() || isLoading || !apiKey}
          >
            {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Filter className="h-4 w-4 mr-2" />}
            Pesquisar
          </Button>
          
          {!apiKey && (
            <div className="text-sm text-amber-600 flex items-center">
              <AlertTriangle className="h-4 w-4 mr-1" />
              Configure sua chave API para realizar buscas semânticas
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

export default AdvancedSearchForm;
