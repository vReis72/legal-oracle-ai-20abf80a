
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSystemSettings } from '@/hooks/useSystemSettings';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Shield, Key, AlertCircle } from 'lucide-react';

const settingsSchema = z.object({
  openaiApiKey: z.string().min(1, 'Chave API é obrigatória').refine(
    (key) => key.startsWith('sk-') && key.length > 40,
    'Chave API deve começar com "sk-" e ter mais de 40 caracteres'
  ),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

const AdminSettingsForm: React.FC = () => {
  const { settings, isLoading, isAdmin, updateApiKey } = useSystemSettings();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      openaiApiKey: settings?.openai_api_key || '',
    },
  });

  React.useEffect(() => {
    if (settings) {
      form.reset({
        openaiApiKey: settings.openai_api_key || '',
      });
    }
  }, [settings, form]);

  if (!isAdmin) {
    return (
      <Card>
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Acesso Restrito</AlertTitle>
            <AlertDescription>
              Apenas administradores podem acessar as configurações do sistema.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const onSubmit = async (data: SettingsFormData) => {
    setIsSubmitting(true);
    try {
      await updateApiKey(data.openaiApiKey);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="text-muted-foreground">Carregando configurações...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-600" />
          Configurações Administrativas
        </CardTitle>
        <CardDescription>
          Gerencie as configurações globais do sistema (apenas administradores)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="openaiApiKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Key className="h-4 w-4" />
                    Chave API OpenAI (Global)
                  </FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder="sk-..." 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Esta chave será usada por todos os usuários do sistema para acessar a API da OpenAI.
                    Obtenha sua chave em{' '}
                    <a 
                      href="https://platform.openai.com/api-keys" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      platform.openai.com/api-keys
                    </a>
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : 'Salvar Configurações'}
            </Button>
          </form>
        </Form>

        {settings?.openai_api_key && (
          <Alert className="mt-4">
            <Key className="h-4 w-4" />
            <AlertTitle>Chave API Configurada</AlertTitle>
            <AlertDescription>
              A chave API OpenAI está configurada e será usada por todo o sistema.
              Última atualização: {new Date(settings.updated_at).toLocaleString('pt-BR')}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminSettingsForm;
