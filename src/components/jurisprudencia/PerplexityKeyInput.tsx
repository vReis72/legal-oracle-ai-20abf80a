
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Key } from 'lucide-react';

interface PerplexityKeyInputProps {
  onKeySubmit: (key: string) => void;
}

const PerplexityKeyInput: React.FC<PerplexityKeyInputProps> = ({ onKeySubmit }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [storedKey, setStoredKey] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Check if API key exists in localStorage
    const savedKey = localStorage.getItem('perplexity_api_key');
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
      localStorage.setItem('perplexity_api_key', apiKey);
      setStoredKey(apiKey);
      onKeySubmit(apiKey);
      setIsOpen(false);
      toast({
        title: "API Key Salva",
        description: "Sua chave da API Perplexity foi salva com sucesso.",
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
            <DialogTitle>Configurar API Perplexity</DialogTitle>
            <DialogDescription>
              Insira sua chave da API Perplexity para habilitar a busca semântica avançada.
              Você pode obter uma chave em <a href="https://www.perplexity.ai/settings/api" target="_blank" rel="noopener noreferrer" className="text-eco-primary hover:underline">perplexity.ai/settings/api</a>.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <Input
              placeholder="pplx-xxxxxxxxxxxxxxxxxxxxxxxx"
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

export default PerplexityKeyInput;
