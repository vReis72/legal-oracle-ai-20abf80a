
import React from 'react';
import DocumentReader from '@/components/documentos/DocumentReader';

const Documentos = () => {
  return (
    <div className="eco-container">
      <div className="mb-6">
        <h1 className="text-3xl font-serif font-bold mb-2 text-eco-dark">Análise de Documentos</h1>
        <p className="text-muted-foreground">
          Carregue e analise pareceres, autos de infração e licenças ambientais
        </p>
      </div>
      
      <DocumentReader />
    </div>
  );
};

export default Documentos;
