
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";
import DocumentReader from '@/components/documentos/DocumentReader';
import ApiKeyCheck from '@/components/shared/ApiKeyCheck';

const Documentos = () => {
  return (
    <ApiKeyCheck>
      <div className="eco-container">
        <div className="mb-6">
          <h1 className="text-3xl font-serif font-bold mb-2 text-eco-dark">Análise de Documentos</h1>
          <p className="text-muted-foreground">
            Carregue e analise pareceres, autos de infração e documentos jurídicos
          </p>
        </div>
        
        <Alert variant="default" className="mb-6 bg-blue-50 border-blue-200">
          <Info className="h-4 w-4 text-blue-500" />
          <AlertTitle>Recomendação para melhor análise</AlertTitle>
          <AlertDescription>
            Para obter os melhores resultados, recomendamos o upload de arquivos de texto (.txt).
            Os arquivos PDF e DOCX podem funcionar, mas a qualidade da análise será menor devido 
            aos desafios na extração do texto.
          </AlertDescription>
        </Alert>
        
        <DocumentReader />
      </div>
    </ApiKeyCheck>
  );
};

export default Documentos;
