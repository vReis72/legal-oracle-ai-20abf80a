
import React from 'react';
import SettingsForm from '@/components/settings/SettingsForm';
import StorageManager from '@/components/settings/StorageManager';
import GlobalApiKeySettings from '@/components/admin/GlobalApiKeySettings';
import { useAuth } from '@/hooks/useAuth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Settings: React.FC = () => {
  const { isAdmin } = useAuth();

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Configurações</h1>
        
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className={`grid w-full ${isAdmin ? 'grid-cols-3' : 'grid-cols-2'}`}>
            <TabsTrigger value="general">Geral</TabsTrigger>
            <TabsTrigger value="storage">Storage</TabsTrigger>
            {isAdmin && <TabsTrigger value="admin">Admin</TabsTrigger>}
          </TabsList>
          
          <TabsContent value="general">
            <SettingsForm />
          </TabsContent>
          
          <TabsContent value="storage">
            <StorageManager />
          </TabsContent>
          
          {isAdmin && (
            <TabsContent value="admin">
              <GlobalApiKeySettings />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default Settings;
