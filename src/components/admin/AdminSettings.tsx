
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield } from 'lucide-react';
import GlobalApiKeySettings from './GlobalApiKeySettings';
import UserManagement from './UserManagement';

const AdminSettings: React.FC = () => {
  const { isAdmin } = useAuth();

  if (!isAdmin) {
    return (
      <Alert variant="destructive">
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Acesso restrito. Esta área é disponível apenas para administradores do sistema.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-serif font-bold text-eco-dark mb-2">
          Configurações Administrativas
        </h2>
        <p className="text-muted-foreground">
          Gerencie as configurações globais do sistema Legal Oracle IA.
        </p>
      </div>

      <GlobalApiKeySettings />
      <UserManagement />
    </div>
  );
};

export default AdminSettings;
