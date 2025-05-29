
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
    // Verificar se realmente precisamos mostrar o diálogo
    console.log("ApiKeyCheck - Estado da chave:");
    console.log("- isKeyConfigured:", isKeyConfigured);
    console.log("- isPlaceholderKey:", isPlaceholderKey);
    console.log("- isEnvironmentKey:", isEnvironmentKey);
    console.log("- apiKey presente:", !!apiKey);
    
    // Só mostrar o diálogo se realmente não tiver uma chave válida
    const shouldShowDialog = !isKeyConfigured && !isEnvironmentKey && isPlaceholderKey;
    console.log("- Deve mostrar diálogo:", shouldShowDialog);
    
    setShowDialog(shouldShowDialog);
  }, [isKeyConfigured, isPlaceholderKey, isEnvironmentKey, apiKey]);

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
      
      {/* Diálogo para configuração de chave API apenas quando necessário */}
      {showDialog && (
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Configurar API OpenAI</DialogTitle>
              <DialogDescription>
                Para usar o assistente de IA, configure uma chave OpenAI válida.
              </DialogDescription>
            </DialogHeader>
            <OpenAIKeyInput 
              forceOpen={true}
              onKeySubmit={(key) => {
                setApiKey(key);
                setShowDialog(false);
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default ApiKeyCheck;
