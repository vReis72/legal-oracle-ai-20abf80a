
import React from 'react';
import SettingsForm from '@/components/settings/SettingsForm';
import GlobalApiKeySettings from '@/components/admin/GlobalApiKeySettings';
import { Settings as SettingsIcon, Key } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Settings: React.FC = () => {
  return (
    <div className="eco-container">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-serif font-bold mb-2 text-eco-dark flex items-center gap-2">
            <SettingsIcon className="h-6 w-6 md:h-8 md:w-8 text-eco-primary" />
            Configurações
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Gerencie as configurações do sistema e suas informações pessoais
          </p>
        </div>
        
        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 mb-6">
            <TabsTrigger value="personal" className="text-sm">Configurações Pessoais</TabsTrigger>
            <TabsTrigger value="api" className="flex items-center gap-2 text-sm">
              <Key className="h-4 w-4" />
              Chave API
            </TabsTrigger>
          </TabsList>
          <TabsContent value="personal" className="mt-6">
            <SettingsForm />
          </TabsContent>
          <TabsContent value="api" className="mt-6">
            <GlobalApiKeySettings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Settings;
