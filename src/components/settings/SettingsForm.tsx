
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUserSettings } from '@/hooks/useUserSettings';
import { useTheme } from '@/providers/ThemeProvider';

const settingsSchema = z.object({
  companyName: z.string().optional(),
  userName: z.string().optional(),
  userOab: z.string().optional(),
  contactEmail: z.string().email('Email inválido').optional().or(z.literal('')),
  theme: z.enum(['light', 'dark', 'system']),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

const SettingsForm: React.FC = () => {
  const { settings, isLoading, saveSettings } = useUserSettings();
  const { setTheme, theme: currentTheme } = useTheme();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      companyName: '',
      userName: '',
      userOab: '',
      contactEmail: '',
      theme: 'light',
    }
  });

  useEffect(() => {
    if (settings) {
      // Garante que apenas valores válidos sejam atribuídos ao tema
      const validTheme = (settings.theme === 'light' || settings.theme === 'dark' || settings.theme === 'system') 
        ? settings.theme 
        : (currentTheme === 'light' || currentTheme === 'dark' || currentTheme === 'system') 
          ? currentTheme 
          : 'light';

      form.reset({
        companyName: settings.company_name || '',
        userName: settings.user_name || '',
        userOab: settings.user_oab || '',
        contactEmail: settings.contact_email || '',
        theme: validTheme,
      });
    }
  }, [settings, form, currentTheme]);

  const onSubmit = async (data: SettingsFormData) => {
    setIsSubmitting(true);
    try {
      // Primeiro aplica o tema imediatamente
      if (data.theme !== currentTheme) {
        setTheme(data.theme);
      }

      // Depois salva as configurações (sem o campo apiKey)
      const success = await saveSettings({
        company_name: data.companyName,
        user_name: data.userName,
        user_oab: data.userOab,
        contact_email: data.contactEmail,
        theme: data.theme,
      });

      if (!success) {
        // Se falhou ao salvar, reverte o tema
        if (data.theme !== currentTheme) {
          setTheme(currentTheme);
        }
      }
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
        <CardTitle>Configurações do Sistema</CardTitle>
        <CardDescription>
          Configure as informações do usuário e preferências do sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Empresa</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome da sua empresa" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contactEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email de Contato</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="contato@empresa.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="userName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Usuário</FormLabel>
                    <FormControl>
                      <Input placeholder="Seu nome completo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="userOab"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>OAB (Opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="SP 123.456" {...field} />
                    </FormControl>
                    <FormDescription>
                      Número da OAB (não obrigatório)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="theme"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tema</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tema" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="light">Claro</SelectItem>
                      <SelectItem value="dark">Escuro</SelectItem>
                      <SelectItem value="system">Sistema</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Escolha o tema de cores do sistema
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
      </CardContent>
    </Card>
  );
};

export default SettingsForm;
