
import React from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const OpenAIKeyInput: React.FC = () => {
  const { isAdmin, loading: authLoading } = useAuth();

  if (authLoading) {
    return (
      <Alert className="mb-4">
        <AlertDescription>
          Carregando...
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="mb-4 border-green-200 bg-green-50">
      <CheckCircle className="h-4 w-4 text-green-500" />
      <AlertDescription>
        <strong>✅ Sistema pronto para uso!</strong><br />
        {isAdmin ? (
          <>Configure uma chave API nas <a href="/settings" className="text-eco-primary hover:underline ml-1">configurações</a> para habilitar o chat.</>
        ) : (
          'O chat será habilitado automaticamente quando uma chave API for configurada.'
        )}
      </AlertDescription>
    </Alert>
  );
};

export default OpenAIKeyInput;
