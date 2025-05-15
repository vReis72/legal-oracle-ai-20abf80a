
import React from 'react';
import { AlertTriangle, CheckCircle } from 'lucide-react';

interface DocumentStatusProps {
  isProcessed: boolean;
  hasContent: boolean;
  isAnalyzing: boolean;
  analysisError: string | null;
}

const DocumentStatus: React.FC<DocumentStatusProps> = ({ 
  isProcessed, 
  hasContent, 
  isAnalyzing, 
  analysisError 
}) => {
  if (analysisError) {
    return (
      <div className="border-l-4 border-red-500 bg-red-50 p-4 rounded-r-md mb-4">
        <div className="flex">
          <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
          <div>
            <h3 className="font-medium text-red-800">Erro na análise</h3>
            <p className="text-sm text-red-700">{analysisError}</p>
          </div>
        </div>
      </div>
    );
  }

  if (hasContent && !isProcessed && !isAnalyzing) {
    return (
      <div className="border-l-4 border-amber-500 bg-amber-50 p-4 rounded-r-md mb-4">
        <div className="flex">
          <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
          <div>
            <h3 className="font-medium text-amber-800">Documento não analisado</h3>
            <p className="text-sm text-amber-700">
              Este documento ainda não foi analisado. Clique no botão "Analisar Documento" para iniciar o processamento.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isProcessed) {
    return (
      <div className="p-4 bg-green-50 border border-green-200 rounded-md">
        <h3 className="text-lg font-medium flex items-center">
          <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
          Análise Concluída
        </h3>
        <p className="text-sm text-muted-foreground">
          O documento foi analisado com sucesso. Veja abaixo os resultados.
        </p>
      </div>
    );
  }

  return null;
};

export default DocumentStatus;
