
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Key } from 'lucide-react';

interface OpenAIKeyInputProps {
  onKeySubmit: (key: string) => void;
}

const OpenAIKeyInput: React.FC<OpenAIKeyInputProps> = ({ onKeySubmit }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [storedKey, setStoredKey] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Check if API key exists in localStorage
    const savedKey = localStorage.getItem('openai_api_key');
    if (savedKey) {
      setStoredKey(savedKey);
      onKeySubmit(savedKey);
    } else {
      setIsOpen(true);
    }
  }, [onKeySubmit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim()) {
      localStorage.setItem('openai_api_key', apiKey);
      setStoredKey(apiKey);
      onKeySubmit(apiKey);
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
              Insira sua chave da API OpenAI para habilitar a busca semântica avançada.
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
            variant="outline" 
            size="sm" 
            onClick={handleUpdateKey}
            className="flex items-center text-xs"
          >
            <Key className="h-3 w-3 mr-1" />
            Atualizar API Key
          </Button>
        </div>
      )}
    </>
  );
};

export default OpenAIKeyInput;
