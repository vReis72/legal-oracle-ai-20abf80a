
import React from 'react';
import SettingsForm from '@/components/settings/SettingsForm';
import { Settings as SettingsIcon } from 'lucide-react';

const Settings: React.FC = () => {
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
        
        <SettingsForm />
      </div>
    </div>
  );
};

export default Settings;
