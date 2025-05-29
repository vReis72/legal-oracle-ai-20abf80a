
import React from 'react';
import SettingsForm from '@/components/settings/SettingsForm';
import AdminSettingsForm from '@/components/settings/AdminSettingsForm';
import { useAuth } from '@/contexts/AuthContext';
import { Settings as SettingsIcon, Shield } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Settings: React.FC = () => {
  const { profile } = useAuth();

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
        
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">Perfil</TabsTrigger>
            <TabsTrigger value="admin" disabled={!profile?.is_admin}>
              <Shield className="h-4 w-4 mr-2" />
              Admin
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            <SettingsForm />
          </TabsContent>
          
          <TabsContent value="admin">
            <AdminSettingsForm />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Settings;
