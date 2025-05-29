
import React from 'react';
import { useApiKey } from '@/hooks/useApiKey';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from 'lucide-react';

interface ApiKeyCheckProps {
  children: React.ReactNode;
}

const ApiKeyCheck: React.FC<ApiKeyCheckProps> = ({ children }) => {
  const { isConfigured } = useApiKey();

  console.log('🚨 ApiKeyCheck - isConfigured:', isConfigured);

  return (
    <>
      {!isConfigured && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Chave API Necessária</AlertTitle>
          <AlertDescription>
            Para usar o chat, configure uma chave OpenAI válida no arquivo src/constants/apiKeys.ts.
            Obtenha uma chave em <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-eco-primary hover:underline">platform.openai.com/api-keys</a>.
          </AlertDescription>
        </Alert>
      )}
      
      {children}
    </>
  );
};

export default ApiKeyCheck;
