
import React from 'react';
import PecasJuridicas from '@/components/pecas/PecasJuridicas';

const PecasJuridicasPage = () => {
  return (
    <div className="eco-container">
      <div className="mb-6">
        <h1 className="text-3xl font-serif font-bold mb-2 text-eco-dark">Geração de Peças Jurídicas</h1>
        <p className="text-muted-foreground">
          Crie peças jurídicas ambientais personalizadas com auxílio de IA
        </p>
      </div>
      
      <PecasJuridicas />
    </div>
  );
};

export default PecasJuridicasPage;
