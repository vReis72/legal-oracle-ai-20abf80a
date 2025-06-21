
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Key, Shield, AlertTriangle, Check } from 'lucide-react';

const GlobalApiKeySettings: React.FC = () => {
  const [newApiKey, setNewApiKey] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [globalApiKey, setGlobalApiKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { isAdmin } = useAuth();
  const { toast } = useToast();

  const loadGlobalApiKey = async () => {
    try {
      const { data } = await supabase
        .from('system_settings')
        .select('openai_api_key')
        .limit(1)
        .maybeSingle();

      setGlobalApiKey(data?.openai_api_key || null);
    } catch (error) {
      console.error('Erro ao carregar chave API global:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadGlobalApiKey();
    }
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <Alert variant="destructive">
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Acesso restrito. Apenas administradores podem configurar a chave API global.
        </AlertDescription>
      </Alert>
    );
  }

  const handleSaveApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newApiKey.trim()) {
      return;
    }

    if (!newApiKey.startsWith('sk-')) {
      toast({
        variant: "destructive",
        title: "Chave inválida",
        description: "A chave API deve começar com 'sk-'",
      });
      return;
    }

    setIsUpdating(true);
    
    try {
      // First check if there's an existing setting
      const { data: existing } = await supabase
        .from('system_settings')
        .select('id')
        .limit(1)
        .maybeSingle();

      if (existing) {
        // Update existing record
        const { error } = await supabase
          .from('system_settings')
          .update({ 
            openai_api_key: newApiKey,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        // Insert new record
        const { error } = await supabase
          .from('system_settings')
          .insert({ 
            openai_api_key: newApiKey
          });

        if (error) throw error;
      }

      setGlobalApiKey(newApiKey);
      setNewApiKey('');
      
      toast({
        title: "Chave salva",
        description: "Chave API global configurada com sucesso",
      });
    } catch (error) {
      console.error('Erro ao salvar chave:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao salvar a chave API",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const hasValidGlobalKey = globalApiKey && globalApiKey.startsWith('sk-');

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
          Esta chave é compartilhada globalmente e apenas administradores podem modificá-la.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasValidGlobalKey ? (
          <Alert>
            <Check className="h-4 w-4" />
            <AlertDescription>
              Chave API configurada e válida. O sistema está operacional para todos os usuários.
            </AlertDescription>
          </Alert>
        ) : (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Nenhuma chave API válida configurada. Os recursos de IA não estarão disponíveis para os usuários.
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
