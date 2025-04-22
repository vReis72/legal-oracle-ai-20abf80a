
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FileText } from "lucide-react";

const Documentos = () => {
  return (
    <div className="eco-container">
      <div className="mb-6">
        <h1 className="text-3xl font-serif font-bold mb-2 text-eco-dark">Documentos</h1>
        <p className="text-muted-foreground mb-4">
          Analise e gerencie seus documentos jurídicos
        </p>
      </div>
      
      <div className="grid gap-6">
        <Alert>
          <FileText className="h-4 w-4 mr-2" />
          <AlertTitle>Análise de Documentos</AlertTitle>
          <AlertDescription>
            O módulo de análise de documentos está em desenvolvimento. Em breve você poderá fazer upload de documentos para análise automatizada com IA.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
};

export default Documentos;
