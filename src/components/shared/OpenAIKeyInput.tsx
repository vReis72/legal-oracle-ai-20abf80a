
import React from 'react';
import { useApiKey } from '@/context/ApiKeyContext';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Shield } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { OpenAIKeyInputProps } from './types/openAIKeyInputTypes';

const OpenAIKeyInput: React.FC<OpenAIKeyInputProps> = ({ 
  onKeySubmit, 
  forceOpen = false, 
  buttonVariant = "outline", 
  buttonSize = "sm" 
}) => {
  const { isKeyConfigured } = useApiKey();
  const { isAdmin } = useAuth();

  // Se a chave já está configurada, não mostrar nada
  if (isKeyConfigured) {
    return null;
  }

  // Se não é admin e não tem chave, mostrar aviso
  if (!isAdmin && !isKeyConfigured) {
    return (
      <Alert variant="destructive" className="mb-4">
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>Sistema não configurado.</strong><br />
          A chave API OpenAI não foi configurada pelo administrador. 
          Entre em contato com o suporte para que o sistema seja configurado adequadamente.
        </AlertDescription>
      </Alert>
    );
  }

  // Para admins sem chave configurada, mostrar aviso diferente
  if (isAdmin && !isKeyConfigured) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Configuração necessária.</strong><br />
          Como administrador, você precisa configurar a chave API OpenAI global nas 
          <a href="/settings" className="text-eco-primary hover:underline ml-1">
            configurações administrativas
          </a>.
        </AlertDescription>
      </Alert>
    );
  }

  return null;
};

export default OpenAIKeyInput;
