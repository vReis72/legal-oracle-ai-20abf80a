
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
  const { isAdmin, loading } = useAuth();

  // Se ainda está carregando, não mostrar nada
  if (loading) {
    return null;
  }

  // Se a chave já está configurada, não mostrar nada
  if (isKeyConfigured) {
    return null;
  }

  // MUDANÇA IMPORTANTE: Permitir que qualquer usuário use o sistema quando a chave não está configurada
  // Apenas mostrar diferentes mensagens para admin vs usuário comum
  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        <strong>Sistema não configurado.</strong><br />
        {isAdmin ? (
          <>
            Como administrador, você precisa configurar a chave API OpenAI global nas 
            <a href="/settings" className="text-eco-primary hover:underline ml-1">
              configurações administrativas
            </a>.
          </>
        ) : (
          <>
            A chave API OpenAI não foi configurada pelo administrador. 
            Entre em contato com o suporte para que o sistema seja configurado adequadamente.
          </>
        )}
      </AlertDescription>
    </Alert>
  );
};

export default OpenAIKeyInput;
