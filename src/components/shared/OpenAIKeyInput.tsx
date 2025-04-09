
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Key, Check } from 'lucide-react';
import { getApiKey, saveApiKey, hasApiKey } from '@/services/apiKeyService';

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
  const [isOpen, setIsOpen] = useState(forceOpen);
  const [apiKey, setApiKey] = useState('');
  const [storedKey, setStoredKey] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Verifica se a chave API existe no localStorage
    const savedKey = getApiKey();
    if (savedKey) {
      setStoredKey(savedKey);
      if (onKeySubmit) onKeySubmit(savedKey);
    } else if (forceOpen) {
      setIsOpen(true);
    }
  }, [onKeySubmit, forceOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim()) {
      saveApiKey(apiKey);
      setStoredKey(apiKey);
      if (onKeySubmit) onKeySubmit(apiKey);
      setIsOpen(false);
      toast({
        title: "API Key Salva",
        description: "Sua chave da API OpenAI foi salva com sucesso.",
      });
    }
  };

  const handleUpdateKey = () => {
    setIsOpen(true);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
              placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full"
            />
            <div className="flex justify-end">
              <Button type="submit" className="bg-eco-primary hover:bg-eco-dark">
                Salvar Chave
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      
      {storedKey && (
        <div className="flex justify-end mb-4">
          <Button 
            variant={buttonVariant} 
            size={buttonSize} 
            onClick={handleUpdateKey}
            className="flex items-center gap-1 text-xs"
          >
            {storedKey ? <Check className="h-3 w-3" /> : <Key className="h-3 w-3" />}
            {storedKey ? "API Configurada" : "Configurar API"}
          </Button>
        </div>
      )}
    </>
  );
};

export default OpenAIKeyInput;
