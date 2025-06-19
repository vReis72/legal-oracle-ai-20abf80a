
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
import { useAuth } from '@/hooks/useAuth';

const settingsSchema = z.object({
  companyName: z.string().optional(),
  userName: z.string().min(1, 'Nome é obrigatório'),
  userOab: z.string().optional(),
  contactEmail: z.string().email('Email inválido').min(1, 'Email é obrigatório'),
  theme: z.enum(['light', 'dark', 'system']),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

const SettingsForm: React.FC = () => {
  const { settings, isLoading, updateTheme, updateCompanyInfo, updateUserInfo } = useUserSettings();
  const { theme: currentTheme } = useTheme();
  const { user, profile } = useAuth();
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
    if (settings || user || profile) {
      // Usa o tema atual do contexto como fallback
      const effectiveTheme = settings?.theme || currentTheme;
      
      // Preenche com dados do perfil/auth como fallback
      const userName = settings?.user_name || profile?.full_name || '';
      const contactEmail = settings?.contact_email || user?.email || '';
      
      console.log('Carregando configurações no formulário:', {
        settingsTheme: settings?.theme,
        currentTheme,
        effectiveTheme,
        userName,
        contactEmail
      });

      form.reset({
        companyName: settings?.company_name || '',
        userName,
        userOab: settings?.user_oab || '',
        contactEmail,
        theme: effectiveTheme,
      });
    }
  }, [settings, form, currentTheme, user, profile]);

  const onSubmit = async (data: SettingsFormData) => {
    setIsSubmitting(true);
    try {
      console.log('Salvando configurações:', data);
      
      // Salva o tema primeiro (isso já aplica o tema via updateTheme)
      if (data.theme !== currentTheme) {
        await updateTheme(data.theme);
      }

      // Salva informações da empresa
      if (data.companyName || data.contactEmail) {
        await updateCompanyInfo(data.companyName || '', data.contactEmail);
      }

      // Salva informações do usuário
      if (data.userName || data.userOab) {
        await updateUserInfo(data.userName || '', data.userOab);
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
                name="userName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Usuário *</FormLabel>
                    <FormControl>
                      <Input placeholder="Seu nome completo" {...field} />
                    </FormControl>
                    <FormDescription>
                      Nome obtido do seu perfil de usuário
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contactEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email de Contato *</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="seu@email.com" {...field} />
                    </FormControl>
                    <FormDescription>
                      Email obtido da sua conta de usuário
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
