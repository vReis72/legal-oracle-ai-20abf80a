
import React from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useGlobalApiKey } from '@/hooks/globalApiKey/GlobalApiKeyContext';
import { Button } from "@/components/ui/button";
import { OpenAIKeyInputProps } from './types/openAIKeyInputTypes';

const OpenAIKeyInput: React.FC<OpenAIKeyInputProps> = ({ 
  onKeySubmit, 
  forceOpen = false, 
  buttonVariant = "outline", 
  buttonSize = "sm" 
}) => {
  const { isAdmin, loading: authLoading } = useAuth();
  const { hasValidGlobalKey, refreshGlobalApiKey, loading: globalLoading, globalApiKey } = useGlobalApiKey();

  console.log('🔑 OpenAIKeyInput: Estado atual:', {
    authLoading,
    globalLoading,
    hasValidGlobalKey,
    isAdmin,
    globalApiKey: globalApiKey ? `${globalApiKey.substring(0, 7)}...` : 'null'
  });

  if (authLoading || globalLoading) {
    return (
      <Alert className="mb-4">
        <RefreshCw className="h-4 w-4 animate-spin" />
        <AlertDescription>
          Verificando configurações...
        </AlertDescription>
      </Alert>
    );
  }

  if (hasValidGlobalKey && !forceOpen) {
    return (
      <Alert className="mb-4 border-green-200 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-500" />
        <AlertDescription>
          <strong>✅ Sistema habilitado!</strong><br />
          Chave API configurada e válida ({globalApiKey?.substring(0, 7)}...).
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <div className="flex-1">
          <strong>❌ Sistema desabilitado</strong><br />
          {isAdmin ? (
            <>
              Nenhuma chave API encontrada ou chave inválida. 
              Configure nas <a href="/settings" className="text-eco-primary hover:underline ml-1">configurações</a>.
            </>
          ) : (
            'Aguarde o administrador configurar uma chave API válida.'
          )}
        </div>
        <div className="flex gap-2 ml-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshGlobalApiKey}
            disabled={globalLoading}
          >
            {globalLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Verificar'}
          </Button>
          {isAdmin && (
            <Button 
              variant="default" 
              size="sm" 
              onClick={() => window.location.href = '/settings'}
            >
              Configurar
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default OpenAIKeyInput;
