
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Construction } from "lucide-react";

const Documentos = () => {
  return (
    <div className="eco-container flex flex-col items-center justify-center py-12">
      <div className="max-w-xl mx-auto text-center">
        <Construction className="h-16 w-16 text-amber-500 mx-auto mb-4" />
        <h1 className="text-3xl font-serif font-bold mb-4 text-eco-dark">Módulo em Desenvolvimento</h1>
        <p className="text-muted-foreground mb-8">
          O módulo de análise de documentos está passando por uma reconstrução para melhorar sua performance e usabilidade.
        </p>
        <Alert variant="default" className="bg-amber-50 border-amber-200">
          <AlertTitle>Em breve</AlertTitle>
          <AlertDescription>
            Estamos trabalhando para disponibilizar uma versão aprimorada deste módulo. 
            Agradecemos sua compreensão e paciência.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
};

export default Documentos;
