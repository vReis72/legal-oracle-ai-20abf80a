
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import SettingsForm from '@/components/settings/SettingsForm';
import AdminSettings from '@/components/admin/AdminSettings';
import { Settings as SettingsIcon, Shield } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Settings: React.FC = () => {
  const { isAdmin } = useAuth();

  return (
    <div className="eco-container">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold mb-2 text-eco-dark flex items-center gap-2">
            <SettingsIcon className="h-8 w-8 text-eco-primary" />
            Configurações
          </h1>
          <p className="text-muted-foreground">
            Gerencie as configurações do sistema e suas informações pessoais
          </p>
        </div>
        
        {isAdmin ? (
          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="personal">Configurações Pessoais</TabsTrigger>
              <TabsTrigger value="admin" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Administração
              </TabsTrigger>
            </TabsList>
            <TabsContent value="personal" className="mt-6">
              <SettingsForm />
            </TabsContent>
            <TabsContent value="admin" className="mt-6">
              <AdminSettings />
            </TabsContent>
          </Tabs>
        ) : (
          <SettingsForm />
        )}
      </div>
    </div>
  );
};

export default Settings;
