
import React from 'react';
import JurisprudenciaSearch from '@/components/jurisprudencia/JurisprudenciaSearch';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

const Jurisprudencia = () => {
  return (
    <div className="eco-container">
      <div className="mb-6">
        <h1 className="text-3xl font-serif font-bold mb-2 text-eco-dark">Consulta de Jurisprudência</h1>
        <p className="text-muted-foreground mb-4">
          Pesquise precedentes judiciais e decisões administrativas em matéria ambiental
        </p>
        
        <Alert variant="default" className="bg-eco-muted border-eco-primary mb-4">
          <InfoIcon className="h-4 w-4 text-eco-primary" />
          <AlertTitle>Busca semântica com IA</AlertTitle>
          <AlertDescription className="text-sm">
            Este sistema utiliza a API da Perplexity para realizar buscas semânticas de jurisprudência ambiental. 
            Você precisará de uma chave API válida, que pode ser obtida em <a href="https://www.perplexity.ai/settings/api" target="_blank" rel="noopener noreferrer" className="text-eco-primary underline">perplexity.ai/settings/api</a>.
          </AlertDescription>
        </Alert>
      </div>
      
      <JurisprudenciaSearch />
    </div>
  );
};

export default Jurisprudencia;
