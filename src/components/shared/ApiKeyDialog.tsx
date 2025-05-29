
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Cloud } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ApiKeyDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onKeySubmit?: (key: string) => void;
  forceOpen: boolean;
  keyConfigured: boolean;
}

const ApiKeyDialog: React.FC<ApiKeyDialogProps> = ({
  isOpen,
  setIsOpen,
  onKeySubmit,
  forceOpen,
  keyConfigured
}) => {
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const { toast } = useToast();

  // Como usamos apenas constante global, sempre false para environment
  const isEnvironmentKey = false;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isEnvironmentKey) {
      toast({
        variant: "warning",
        title: "Operação não permitida",
        description: "Uma chave API já está configurada através de variáveis de ambiente (Railway).",
      });
      setIsOpen(false);
      return;
    }
    
    if (!apiKeyInput.trim()) {
      toast({
        variant: "destructive",
        title: "Erro de validação",
        description: "A chave API não pode estar vazia.",
      });
      return;
    }
    
    if (!apiKeyInput.trim().startsWith('sk-')) {
      toast({
        variant: "destructive",
        title: "Formato inválido",
        description: "A chave API da OpenAI deve começar com 'sk-'.",
      });
      return;
    }
    
    if (apiKeyInput.trim() === 'sk-adicione-uma-chave-valida-aqui') {
      toast({
        variant: "destructive",
        title: "Chave inválida",
        description: "Esta é uma chave de placeholder. Por favor, insira sua chave OpenAI real.",
      });
      return;
    }
    
    setIsValidating(true);
    
    try {
      if (onKeySubmit) {
        onKeySubmit(apiKeyInput.trim());
      }
      
      setIsOpen(false);
      setApiKeyInput('');
      
      toast({
        title: "API Key Salva",
        description: "Sua chave da API OpenAI foi salva com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao salvar chave:", error);
      toast({
        variant: "destructive",
        title: "Erro ao salvar chave",
        description: "Não foi possível salvar a chave OpenAI.",
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleResetToDefault = () => {
    if (isEnvironmentKey) {
      toast({
        variant: "warning",
        title: "Operação não permitida",
        description: "Não é possível remover uma chave configurada através de variáveis de ambiente (Railway).",
      });
      return;
    }
    
    setIsOpen(false);
    toast({
      variant: "destructive",
      title: "Chave API removida",
      description: "É necessário configurar uma chave API válida para utilizar o sistema.",
    });
  };

  const handleOpenChange = (open: boolean) => {
    if (isEnvironmentKey && open) {
      toast({
        variant: "info",
        title: "API Key do Ambiente",
        description: "A chave API está configurada através de variáveis de ambiente (Railway).",
      });
      return;
    }
    
    if (forceOpen && !keyConfigured && !open) return;
    setIsOpen(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Configurar API OpenAI</DialogTitle>
          <DialogDescription>
            Insira sua chave da API OpenAI para ativar os recursos de IA.
            Você pode obter uma chave em <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-eco-primary hover:underline">platform.openai.com/api-keys</a>.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Input
              placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              className="w-full"
              disabled={isValidating || isEnvironmentKey}
            />
            <p className="text-xs text-muted-foreground">
              A chave deve começar com "sk-" e ser longa o suficiente para ser válida.
            </p>
          </div>
          
          <div className="flex justify-end gap-2">
            {!forceOpen && !isEnvironmentKey && (
              <Button 
                type="button" 
                variant="outline"
                onClick={handleResetToDefault}
                disabled={isValidating}
              >
                Remover chave
              </Button>
            )}
            <Button 
              type="submit" 
              className="bg-eco-primary hover:bg-eco-dark"
              disabled={isValidating || isEnvironmentKey}
            >
              {isValidating ? 'Salvando...' : (isEnvironmentKey ? 'Chave do Ambiente' : 'Salvar Chave')}
            </Button>
          </div>
          
          {isEnvironmentKey && (
            <Alert className="mt-2 bg-blue-50 border-blue-200">
              <Cloud className="h-4 w-4 text-blue-700" />
              <AlertDescription className="text-blue-700">
                A chave API está configurada através de variáveis de ambiente (Railway).
              </AlertDescription>
            </Alert>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ApiKeyDialog;
