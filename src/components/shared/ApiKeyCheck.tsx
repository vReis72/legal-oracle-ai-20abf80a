
import React, { useEffect, useState } from 'react';
import { useGlobalApiKey } from '@/hooks/useGlobalApiKey';
import OpenAIKeyInput from './OpenAIKeyInput';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Cloud } from 'lucide-react';

interface ApiKeyCheckProps {
  children: React.ReactNode;
}

const ApiKeyCheck: React.FC<ApiKeyCheckProps> = ({ children }) => {
  const { globalApiKey, hasValidGlobalKey, loading } = useGlobalApiKey();
  const [showDialog, setShowDialog] = useState(false);
  
  useEffect(() => {
    if (loading) return;
    
    if (!hasValidGlobalKey) {
      const timer = setTimeout(() => {
        setShowDialog(true);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setShowDialog(false);
    }
  }, [hasValidGlobalKey, loading]);

  return (
    <>
      {!hasValidGlobalKey && !loading && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Atenção!</AlertTitle>
          <AlertDescription>
            A chave API OpenAI não foi configurada pelo administrador. Entre em contato com o suporte para configurar o sistema.
          </AlertDescription>
        </Alert>
      )}
      
      {children}
      
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Sistema não configurado</DialogTitle>
            <DialogDescription>
              A chave API OpenAI não foi configurada pelo administrador do sistema. 
              Entre em contato com o suporte para que a chave seja configurada nas configurações administrativas.
            </DialogDescription>
          </DialogHeader>
          <div className="pt-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Apenas administradores podem configurar a chave API global do sistema.
              </AlertDescription>
            </Alert>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ApiKeyCheck;
