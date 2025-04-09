
import React from 'react';
import JurisprudenciaSearch from '@/components/jurisprudencia/JurisprudenciaSearch';

const Jurisprudencia = () => {
  return (
    <div className="eco-container">
      <div className="mb-6">
        <h1 className="text-3xl font-serif font-bold mb-2 text-eco-dark">Consulta de Jurisprudência</h1>
        <p className="text-muted-foreground">
          Pesquise precedentes judiciais e decisões administrativas em matéria ambiental
        </p>
      </div>
      
      <JurisprudenciaSearch />
    </div>
  );
};

export default Jurisprudencia;
