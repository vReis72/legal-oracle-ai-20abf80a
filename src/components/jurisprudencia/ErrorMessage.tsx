
import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ErrorMessageProps {
  error: string | null;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ error }) => {
  if (!error) return null;

  return (
    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
      <div className="flex items-center text-red-800">
        <AlertTriangle className="h-4 w-4 mr-2" />
        <p className="font-medium">Erro na consulta</p>
      </div>
      <p className="text-sm text-red-700 mt-1">{error}</p>
    </div>
  );
};

export default ErrorMessage;
