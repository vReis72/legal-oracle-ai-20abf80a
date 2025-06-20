
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
  const { hasValidGlobalKey, refreshGlobalApiKey, loading: globalLoading } = useGlobalApiKey();

  // Se ainda está carregando, mostrar indicador
  if (authLoading || globalLoading) {
    return (
      <Alert className="mb-4">
        <RefreshCw className="h-4 w-4 animate-spin" />
        <AlertDescription>
          Verificando chave API na tabela system_settings...
        </AlertDescription>
      </Alert>
    );
  }

  // Se há chave válida na tabela system_settings, sistema habilitado
  if (hasValidGlobalKey && !forceOpen) {
    return (
      <Alert className="mb-4 border-green-200 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-500" />
        <AlertDescription>
          <strong>✅ Sistema habilitado!</strong><br />
          Chave API encontrada na tabela system_settings. Ferramenta pronta para uso.
        </AlertDescription>
      </Alert>
    );
  }

  // Se não há chave na tabela, sistema desabilitado
  return (
    <Alert variant="destructive" className="mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <div>
          <strong>❌ Sistema desabilitado</strong><br />
          {isAdmin ? (
            <>
              Nenhuma chave API encontrada na tabela system_settings. Configure uma chave nas 
              <a href="/settings" className="text-eco-primary hover:underline ml-1">
                configurações administrativas
              </a> para habilitar o sistema.
            </>
          ) : (
            <>
              O administrador precisa configurar uma chave API OpenAI na tabela system_settings 
              para habilitar o sistema.
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
            {globalLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Verificar'}
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
};

export default OpenAIKeyInput;
