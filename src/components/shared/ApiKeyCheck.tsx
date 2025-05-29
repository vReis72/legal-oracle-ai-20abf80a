
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
    // Se estiver usando uma chave do ambiente, não precisamos mostrar o diálogo
    if (isEnvironmentKey) {
      setShowDialog(false);
      return;
    }
    
    // Verificar se a chave já está configurada no localStorage ou no contexto
    const keyExists = hasApiKey() || isKeyConfigured;
    const isValidKey = keyExists && !isPlaceholderKey;
    
    if (!isValidKey) {
      // Aguardar 1 segundo para mostrar o diálogo (para evitar flash durante o carregamento)
      const timer = setTimeout(() => {
        setShowDialog(true);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      // Garantir que o diálogo não seja exibido se a chave já estiver configurada
      setShowDialog(false);
    }
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
      
      {isPlaceholderKey && !isEnvironmentKey && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Atenção!</AlertTitle>
          <AlertDescription>
            A chave API atual é inválida. É necessário configurar uma chave API OpenAI válida para utilizar o sistema.
          </AlertDescription>
        </Alert>
      )}
      
      {children}
      
      <Dialog open={showDialog && !isEnvironmentKey} onOpenChange={(open) => {
        // Permitir fechar o diálogo se o usuário cancelar
        setShowDialog(open);
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Bem-vindo ao Legal Oracle IA</DialogTitle>
            <DialogDescription>
              Para utilizar todos os recursos do Legal Oracle IA, é necessário configurar sua chave da API OpenAI.
              Você pode obter uma chave em <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-eco-primary hover:underline">platform.openai.com/api-keys</a>.
            </DialogDescription>
          </DialogHeader>
          <div className="pt-4">
            <OpenAIKeyInput 
              onKeySubmit={(key) => {
                setApiKey(key);
                setShowDialog(false);
              }}
              forceOpen={true}
              buttonVariant="default"
              buttonSize="default"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ApiKeyCheck;
