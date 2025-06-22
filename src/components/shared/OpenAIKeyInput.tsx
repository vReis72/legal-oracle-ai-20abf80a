
import React from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { useGlobalApiKey } from '@/hooks/globalApiKey/GlobalApiKeyContext';
import { Button } from "@/components/ui/button";
import { OpenAIKeyInputProps } from './types/openAIKeyInputTypes';

const OpenAIKeyInput: React.FC<OpenAIKeyInputProps> = ({ 
  onKeySubmit, 
  forceOpen = false, 
  buttonVariant = "outline", 
  buttonSize = "sm" 
}) => {
  const { hasValidGlobalKey, refreshGlobalApiKey, loading, globalApiKey } = useGlobalApiKey();

  console.log('🔑 OpenAIKeyInput: Estado:', {
    loading,
    hasValidGlobalKey,
    hasKey: !!globalApiKey,
    keyLength: globalApiKey?.length || 0
  });

  // Loading state
  if (loading) {
    return (
      <Alert className="mb-4">
        <RefreshCw className="h-4 w-4 animate-spin" />
        <AlertDescription>
          Carregando configurações da chave API...
        </AlertDescription>
      </Alert>
    );
  }

  // Success state - chave válida configurada
  if (hasValidGlobalKey && !forceOpen) {
    return (
      <Alert className="mb-4 border-green-200 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-500" />
        <AlertDescription>
          <div className="flex items-center justify-between">
            <div>
              <strong>✅ Sistema habilitado!</strong><br />
              Chave API OpenAI configurada corretamente ({globalApiKey?.substring(0, 7)}...).
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refreshGlobalApiKey}
              className="ml-2"
            >
              Verificar novamente
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  // Error state - sem chave ou chave inválida
  return (
    <Alert variant="destructive" className="mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <strong>❌ Sistema desabilitado</strong><br />
            {!globalApiKey ? 
              'Nenhuma chave API encontrada.' : 
              'Chave API inválida encontrada.'
            } Configure nas configurações.
          </div>
          <div className="flex gap-2 ml-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refreshGlobalApiKey}
              disabled={loading}
            >
              {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Verificar'}
            </Button>
            <Button 
              variant="default" 
              size="sm" 
              onClick={() => window.location.href = '/settings'}
            >
              Configurar
            </Button>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default OpenAIKeyInput;
