
import React from 'react';
import DocumentReader from '@/components/documentos/DocumentReader';
import ApiKeyCheck from '@/components/shared/ApiKeyCheck';

const Documentos = () => {
  return (
    <ApiKeyCheck>
      <div className="eco-container">
        <div className="mb-6">
          <h1 className="text-3xl font-serif font-bold mb-2 text-eco-dark">Análise de Documentos</h1>
          <p className="text-muted-foreground">
            Carregue e analise pareceres, autos de infração e licenças ambientais
          </p>
        </div>
        
        <DocumentReader />
      </div>
    </ApiKeyCheck>
  );
};

export default Documentos;
