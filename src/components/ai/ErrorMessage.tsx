
import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface ErrorMessageProps {
  error: string | null;
  onRetry: () => void;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ error, onRetry }) => {
  if (!error) return null;
  
  return (
    <div className="flex justify-center mb-4">
      <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 max-w-[90%]">
        <div className="flex items-center mb-2">
          <AlertTriangle className="h-4 w-4 mr-2 text-red-500" />
          <span className="font-medium">Erro ao processar resposta</span>
        </div>
        <p className="text-sm mb-3">{error}</p>
        <div className="flex justify-end">
          <Button 
            variant="outline" 
            size="sm"
            onClick={onRetry}
            className="text-xs flex items-center"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Tentar novamente
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ErrorMessage;
