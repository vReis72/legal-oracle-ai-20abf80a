
import React, { useEffect, useState } from 'react';
import { useGlobalApiKey } from '@/hooks/useGlobalApiKey';
import { useAuth } from '@/hooks/useAuth';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Shield } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';

interface ApiKeyCheckProps {
  children: React.ReactNode;
}

const ApiKeyCheck: React.FC<ApiKeyCheckProps> = ({ children }) => {
  const { globalApiKey, hasValidGlobalKey, loading } = useGlobalApiKey();
  const { isAdmin, loading: authLoading } = useAuth();
  const [showDialog, setShowDialog] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    if (loading || authLoading) return;
    
    // MUDANÇA: Apenas mostrar aviso, mas permitir uso do sistema
    if (!hasValidGlobalKey) {
      const timer = setTimeout(() => {
        setShowDialog(true);
      }, 2000); // Aumentar tempo para 2 segundos
      return () => clearTimeout(timer);
    } else {
      setShowDialog(false);
    }
  }, [hasValidGlobalKey, loading, authLoading]);

  // MUDANÇA IMPORTANTE: Sempre renderizar children, mesmo sem chave válida
  return (
    <>
      {!hasValidGlobalKey && !loading && !authLoading && (
        <Alert variant="destructive" className="mb-4">
          <Shield className="h-4 w-4" />
          <AlertTitle>Sistema não configurado</AlertTitle>
          <AlertDescription>
            {isAdmin 
              ? "Como administrador, você precisa configurar a chave API OpenAI global nas configurações."
              : "A chave API OpenAI não foi configurada pelo administrador. Entre em contato com o suporte."
            }
          </AlertDescription>
        </Alert>
      )}
      
      {children}
      
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isAdmin ? "Configuração necessária" : "Sistema não configurado"}
            </DialogTitle>
            <DialogDescription>
              {isAdmin 
                ? "Como administrador, você precisa configurar a chave API OpenAI global para que o sistema funcione para todos os usuários."
                : "A chave API OpenAI não foi configurada pelo administrador do sistema. Entre em contato com o suporte para que a chave seja configurada."
              }
            </DialogDescription>
          </DialogHeader>
          <div className="pt-4">
            {isAdmin ? (
              <Button 
                onClick={() => {
                  navigate('/settings');
                  setShowDialog(false);
                }}
                className="w-full bg-eco-primary hover:bg-eco-dark"
              >
                Ir para Configurações
              </Button>
            ) : (
              <Button 
                onClick={() => setShowDialog(false)}
                variant="outline"
                className="w-full"
              >
                Entendi
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ApiKeyCheck;
