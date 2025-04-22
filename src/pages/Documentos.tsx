
import React, { Suspense } from 'react';
import DocumentReader from '../components/documentos/DocumentReader';
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const Documentos = () => {
  return (
    <div className="eco-container py-8">
      <Suspense fallback={
        <Card>
          <CardContent className="flex items-center justify-center p-6">
            <Loader2 className="h-8 w-8 animate-spin text-eco-primary" />
            <span className="ml-2 text-muted-foreground">Carregando módulo de documentos...</span>
          </CardContent>
        </Card>
      }>
        <DocumentReader />
      </Suspense>
    </div>
  );
};

export default Documentos;
