
import React from 'react';
import NormasAlertas from '@/components/alertas/NormasAlertas';

const Alertas = () => {
  return (
    <div className="eco-container">
      <div className="mb-6">
        <h1 className="text-3xl font-serif font-bold mb-2 text-eco-dark">Alertas Normativos</h1>
        <p className="text-muted-foreground">
          Acompanhe novas normas, resoluções e decisões de órgãos ambientais
        </p>
      </div>
      
      <NormasAlertas />
    </div>
  );
};

export default Alertas;
