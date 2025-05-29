
import React, { useEffect, useState } from 'react';
import { hasGlobalApiKey, getGlobalApiKey } from '@/constants/apiKeys';
import OpenAIKeyInput from './OpenAIKeyInput';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Cloud } from 'lucide-react';

interface ApiKeyCheckProps {
  children: React.ReactNode;
}

const ApiKeyCheck: React.FC<ApiKeyCheckProps> = ({ children }) => {
  // Usar apenas funções globais
  const apiKey = getGlobalApiKey();
  const isKeyConfigured = hasGlobalApiKey();
  const isPlaceholderKey = !isKeyConfigured;
  const isEnvironmentKey = false; // Sempre false pois usamos apenas constante
  
  const [showDialog, setShowDialog] = useState(false);
  
  useEffect(() => {
    console.log("ApiKeyCheck - Verificando estado da chave:");
    console.log("- isKeyConfigured:", isKeyConfigured);
    console.log("- isPlaceholderKey:", isPlaceholderKey);
    console.log("- isEnvironmentKey:", isEnvironmentKey);
    console.log("- apiKey presente:", !!apiKey);
    console.log("- apiKey válida:", apiKey?.length, "caracteres");
    
    // Só mostrar o diálogo se realmente não tiver uma chave válida
    // E não for uma chave do ambiente
    const shouldShowDialog = (!isKeyConfigured || isPlaceholderKey) && !isEnvironmentKey;
    console.log("- Deve mostrar diálogo:", shouldShowDialog);
    
    setShowDialog(shouldShowDialog);
  }, [isKeyConfigured, isPlaceholderKey, isEnvironmentKey, apiKey]);

  const setApiKey = (key: string) => {
    console.log('setApiKey chamado com chave:', key.substring(0, 20) + '...');
    // Como usamos apenas constante, apenas log
  };

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
      
      {/* Diálogo para configuração de chave API quando necessário */}
      {showDialog && (
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Configurar API OpenAI</DialogTitle>
              <DialogDescription>
                Para usar o assistente de IA, configure uma chave OpenAI válida.
                Você pode obter uma chave em <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-eco-primary hover:underline">platform.openai.com/api-keys</a>.
              </DialogDescription>
            </DialogHeader>
            <OpenAIKeyInput 
              forceOpen={true}
              onKeySubmit={(key) => {
                console.log("📝 Nova chave submetida:", key.substring(0, 20) + "...");
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
