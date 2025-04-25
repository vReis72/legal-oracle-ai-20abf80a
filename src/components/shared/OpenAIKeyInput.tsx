
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Key, Check } from 'lucide-react';
import { useApiKey } from '@/context/ApiKeyContext';
import { hasApiKey } from '@/services/apiKeyService';

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
  const { apiKey, setApiKey, isKeyConfigured } = useApiKey();
  const { toast } = useToast();

  // Verificar se já existe uma chave armazenada
  const keyConfigured = hasApiKey() || isKeyConfigured;

  useEffect(() => {
    // Só abrir o diálogo se forceOpen for true E não houver chave configurada
    if (forceOpen && !keyConfigured) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [forceOpen, keyConfigured]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
  };

  const handleUpdateKey = () => {
    setIsOpen(true);
  };

  // Se forceOpen for true mas a chave já estiver configurada, não mostramos nada
  if (forceOpen && keyConfigured) {
    return null;
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => {
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
            <Input
              placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx ou sk-proj-xxxxxxxx"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              className="w-full"
              disabled={isValidating}
            />
            <div className="flex justify-end">
              <Button 
                type="submit" 
                className="bg-eco-primary hover:bg-eco-dark"
                disabled={isValidating}
              >
                {isValidating ? 'Validando...' : 'Salvar Chave'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      
      {!forceOpen && (
        <div className="flex justify-end mb-4">
          <Button 
            variant={buttonVariant} 
            size={buttonSize} 
            onClick={handleUpdateKey}
            className="flex items-center gap-1 text-xs"
          >
            {keyConfigured ? <Check className="h-3 w-3" /> : <Key className="h-3 w-3" />}
            {keyConfigured ? "API Configurada" : "Configurar API"}
          </Button>
        </div>
      )}
    </>
  );
};

export default OpenAIKeyInput;

