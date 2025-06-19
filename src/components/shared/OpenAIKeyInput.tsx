
import React from 'react';
import { useApiKey } from '@/context/ApiKeyContext';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { OpenAIKeyInputProps } from './types/openAIKeyInputTypes';

const OpenAIKeyInput: React.FC<OpenAIKeyInputProps> = ({ 
  onKeySubmit, 
  forceOpen = false, 
  buttonVariant = "outline", 
  buttonSize = "sm" 
}) => {
  const { isKeyConfigured } = useApiKey();
  const { isAdmin, loading } = useAuth();

  console.log('🔑 OpenAIKeyInput: Estado atual:', {
    isKeyConfigured,
    isAdmin,
    loading,
    forceOpen
  });

  // Se ainda está carregando, não mostrar nada
  if (loading) {
    return null;
  }

  // Se a chave já está configurada e não é forçado, não mostrar nada
  if (isKeyConfigured && !forceOpen) {
    return null;
  }

  // Se não há chave configurada, mostrar aviso mas PERMITIR uso
  if (!isKeyConfigured) {
    return (
      <Alert variant="warning" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Sistema funcionando sem chave OpenAI configurada.</strong><br />
          {isAdmin ? (
            <>
              Como administrador, você pode configurar a chave API OpenAI global nas 
              <a href="/settings" className="text-eco-primary hover:underline ml-1">
                configurações administrativas
              </a> para melhorar o desempenho.
            </>
          ) : (
            <>
              O administrador ainda não configurou a chave API OpenAI. 
              O sistema funcionará, mas pode ter limitações.
            </>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  return null;
};

export default OpenAIKeyInput;
