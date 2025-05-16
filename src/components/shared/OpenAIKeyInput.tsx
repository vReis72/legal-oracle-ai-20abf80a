
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Key, Check, RefreshCcw, AlertTriangle, AlertCircle, Cloud } from 'lucide-react';
import { useApiKey } from '@/context/ApiKeyContext';
import { hasApiKey } from '@/services/apiKeyService';
import { Alert, AlertDescription } from "@/components/ui/alert";

interface OpenAIKeyInputProps {
  onKeySubmit?: (key: string) => void;
  forceOpen?: boolean;
  buttonVariant?: "default" | "outline" | "secondary" | "destructive" | "link";
  buttonSize?: "default" | "sm" | "lg" | "icon";
}

const OpenAIKeyInput: React.FC<OpenAIKeyInputProps> = ({ 
  onKeySubmit, 
  forceOpen = false, 
  buttonVariant = "outline", 
  buttonSize = "sm" 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const { apiKey, setApiKey, isKeyConfigured, resetApiKey, isPlaceholderKey, isEnvironmentKey } = useApiKey();
  const { toast } = useToast();
  const [showError, setShowError] = useState(false);

  // Verificar se já existe uma chave armazenada que NÃO é placeholder
  const keyConfigured = (hasApiKey() && isKeyConfigured && !isPlaceholderKey) || isEnvironmentKey;

  useEffect(() => {
    // Só abrir o diálogo se forceOpen for true E não houver chave configurada
    // E não estiver usando uma chave do ambiente
    if (forceOpen && (!keyConfigured || isPlaceholderKey) && !isEnvironmentKey) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
    
    // Mostrar mensagem de erro se a chave for placeholder e não estiver usando chave do ambiente
    setShowError(isPlaceholderKey && !isEnvironmentKey);
  }, [forceOpen, keyConfigured, isPlaceholderKey, isEnvironmentKey]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Não permitir configuração se estiver usando chave do ambiente
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
    
    // Validar formato da chave OpenAI (permite sk- ou sk-proj-)
    if (!apiKeyInput.trim().startsWith('sk-')) {
      toast({
        variant: "destructive",
        title: "Formato inválido",
        description: "A chave API da OpenAI deve começar com 'sk-'.",
      });
      return;
    }
    
    // Verificar se é o placeholder
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
      // Salvar a chave
      setApiKey(apiKeyInput.trim());
      
      // Chamar callback se fornecido
      if (onKeySubmit) {
        onKeySubmit(apiKeyInput.trim());
      }
      
      setIsOpen(false);
      setApiKeyInput(''); // Limpar campo após envio
      
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

  const handleUpdateKey = () => {
    // Não permitir alteração se estiver usando chave do ambiente
    if (isEnvironmentKey) {
      toast({
        variant: "info",
        title: "API Key do Ambiente",
        description: "A chave API está configurada através de variáveis de ambiente (Railway).",
      });
      return;
    }
    setIsOpen(true);
  };

  const handleResetToDefault = () => {
    // Não permitir remover se estiver usando chave do ambiente
    if (isEnvironmentKey) {
      toast({
        variant: "warning",
        title: "Operação não permitida",
        description: "Não é possível remover uma chave configurada através de variáveis de ambiente (Railway).",
      });
      return;
    }
    resetApiKey();
    setIsOpen(false);
    toast({
      variant: "destructive",
      title: "Chave API removida",
      description: "É necessário configurar uma chave API válida para utilizar o sistema.",
    });
  };

  // Se forceOpen for true mas a chave já estiver configurada, não mostramos nada
  if (forceOpen && keyConfigured) {
    return null;
  }

  return (
    <>
      {showError && !forceOpen && (
        <Alert variant="destructive" className="mb-3">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            A chave API atual é inválida. Por favor, configure uma nova chave.
          </AlertDescription>
        </Alert>
      )}
      
      <Dialog open={isOpen} onOpenChange={(open) => {
        // Não permitir abrir o diálogo se estiver usando chave do ambiente
        if (isEnvironmentKey && open) {
          toast({
            variant: "info",
            title: "API Key do Ambiente",
            description: "A chave API está configurada através de variáveis de ambiente (Railway).",
          });
          return;
        }
        
        // Permitir fechar o diálogo somente se não estamos forçando ele aberto
        // ou se a chave já estiver configurada
        if (forceOpen && !keyConfigured && !open) return;
        setIsOpen(open);
      }}>
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
      
      {!forceOpen && (
        <div className="flex justify-end mb-4">
          <Button 
            variant={isPlaceholderKey ? "destructive" : (keyConfigured ? "outline" : "default")} 
            size={buttonSize} 
            onClick={handleUpdateKey}
            className="flex items-center gap-1 text-xs"
          >
            {isPlaceholderKey ? (
              <AlertTriangle className="h-3 w-3" />
            ) : isEnvironmentKey ? (
              <Cloud className="h-3 w-3 text-blue-600" />
            ) : (keyConfigured ? (
              <Check className="h-3 w-3" />
            ) : (
              <Key className="h-3 w-3" />
            ))}
            {isPlaceholderKey ? "API Inválida!" : (
              isEnvironmentKey ? "API Railway" : (
                keyConfigured ? "API Configurada" : "Configurar API"
              )
            )}
          </Button>
        </div>
      )}
    </>
  );
};

export default OpenAIKeyInput;
