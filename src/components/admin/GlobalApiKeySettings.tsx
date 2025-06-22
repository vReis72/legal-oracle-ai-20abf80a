
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useGlobalApiKey } from '@/hooks/useGlobalApiKey';
import { Key, AlertTriangle, Check } from 'lucide-react';

const GlobalApiKeySettings: React.FC = () => {
  const [newApiKey, setNewApiKey] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const { globalApiKey, hasValidGlobalKey, saveGlobalApiKey, loading } = useGlobalApiKey();

  const handleSaveApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newApiKey.trim()) {
      return;
    }

    if (!newApiKey.startsWith('sk-')) {
      return;
    }

    setIsUpdating(true);
    
    try {
      const success = await saveGlobalApiKey(newApiKey);
      if (success) {
        setNewApiKey('');
      }
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Chave API OpenAI Global
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-eco-primary border-r-transparent" />
            Carregando configurações...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          Chave API OpenAI Global
        </CardTitle>
        <CardDescription>
          Configure a chave API OpenAI que será utilizada por todos os usuários do sistema.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasValidGlobalKey ? (
          <Alert>
            <Check className="h-4 w-4" />
            <AlertDescription>
              Chave API configurada e válida. O sistema está operacional.
            </AlertDescription>
          </Alert>
        ) : (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Nenhuma chave API válida configurada. Os recursos de IA não estarão disponíveis.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label>Status da Chave Atual</Label>
          <div className="p-3 bg-muted rounded-md">
            {globalApiKey ? (
              <span className="font-mono text-sm">
                {globalApiKey.substring(0, 7)}...{globalApiKey.substring(globalApiKey.length - 4)}
              </span>
            ) : (
              <span className="text-muted-foreground">Nenhuma chave configurada</span>
            )}
          </div>
        </div>

        <form onSubmit={handleSaveApiKey} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="api-key">Nova Chave API OpenAI</Label>
            <Input
              id="api-key"
              type="password"
              placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              value={newApiKey}
              onChange={(e) => setNewApiKey(e.target.value)}
              disabled={isUpdating}
            />
            <p className="text-xs text-muted-foreground">
              A chave deve começar com "sk-" e ser obtida em{' '}
              <a 
                href="https://platform.openai.com/api-keys" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-eco-primary hover:underline"
              >
                platform.openai.com/api-keys
              </a>
            </p>
          </div>

          <Button 
            type="submit" 
            disabled={!newApiKey.trim() || !newApiKey.startsWith('sk-') || isUpdating}
            className="bg-eco-primary hover:bg-eco-dark"
          >
            {isUpdating ? 'Salvando...' : 'Salvar Chave API'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default GlobalApiKeySettings;
