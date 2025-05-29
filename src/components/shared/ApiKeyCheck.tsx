
import React, { useEffect, useState } from 'react';
import { useApiKey } from '@/context/ApiKeyContext';
import OpenAIKeyInput from './OpenAIKeyInput';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { hasApiKey } from '@/services/apiKeyService';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Cloud } from 'lucide-react';

interface ApiKeyCheckProps {
  children: React.ReactNode;
}

const ApiKeyCheck: React.FC<ApiKeyCheckProps> = ({ children }) => {
  const { apiKey, setApiKey, isKeyConfigured, isPlaceholderKey, isEnvironmentKey } = useApiKey();
  const [showDialog, setShowDialog] = useState(false);
  
  useEffect(() => {
    // Em desenvolvimento, nunca mostrar o diálogo
    console.log("ApiKeyCheck - isKeyConfigured:", isKeyConfigured);
    setShowDialog(false);
  }, [isKeyConfigured, isPlaceholderKey, isEnvironmentKey]);

  return (
    <>
      {isEnvironmentKey && (
        <Alert variant="default" className="mb-4 bg-blue-50 border-blue-200">
          <Cloud className="h-4 w-4 text-blue-700" />
          <AlertTitle className="text-blue-700">Configuração via Railway</AlertTitle>
          <AlertDescription className="text-blue-600">
            O sistema está utilizando a chave API OpenAI configurada através de variáveis de ambiente.
          </AlertDescription>
        </Alert>
      )}
      
      {children}
      
      {/* Diálogo removido para desenvolvimento */}
    </>
  );
};

export default ApiKeyCheck;
