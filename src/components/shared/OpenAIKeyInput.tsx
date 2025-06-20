
import React from 'react';
import { useApiKey } from '@/context/ApiKeyContext';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useGlobalApiKey } from '@/hooks/useGlobalApiKey';
import { Button } from "@/components/ui/button";
import { OpenAIKeyInputProps } from './types/openAIKeyInputTypes';

const OpenAIKeyInput: React.FC<OpenAIKeyInputProps> = ({ 
  onKeySubmit, 
  forceOpen = false, 
  buttonVariant = "outline", 
  buttonSize = "sm" 
}) => {
  const { isKeyConfigured } = useApiKey();
  const { isAdmin, loading } = useAuth();
  const { refreshGlobalApiKey, loading: globalLoading } = useGlobalApiKey();

  console.log('🔑 OpenAIKeyInput: Estado atual:', {
    isKeyConfigured,
    isAdmin,
    loading,
    globalLoading,
    forceOpen
  });

  // Se ainda está carregando, mostrar indicador
  if (loading || globalLoading) {
    return (
      <Alert className="mb-4">
        <RefreshCw className="h-4 w-4 animate-spin" />
        <AlertDescription>
          Carregando configurações da chave API...
        </AlertDescription>
      </Alert>
    );
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
        <AlertDescription className="flex items-center justify-between">
          <div>
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
          </div>
          {isAdmin && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refreshGlobalApiKey}
              disabled={globalLoading}
            >
              {globalLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Recarregar'}
            </Button>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  return null;
};

export default OpenAIKeyInput;
