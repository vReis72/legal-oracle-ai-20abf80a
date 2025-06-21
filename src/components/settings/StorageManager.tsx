
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from '@/hooks/use-toast';
import { LocalStorageUtils } from '@/utils/localStorage';
import { Trash2, Database, AlertTriangle } from 'lucide-react';

const StorageManager: React.FC = () => {
  const { toast } = useToast();

  const handleClearAll = () => {
    if (window.confirm('Tem certeza que deseja limpar TODOS os dados do localStorage? Esta ação não pode ser desfeita.')) {
      LocalStorageUtils.clearAll();
      toast({
        title: "Storage limpo",
        description: "Todos os dados do localStorage foram removidos. A página será recarregada.",
      });
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  const handleClearProjectData = () => {
    if (window.confirm('Tem certeza que deseja limpar os dados do projeto (documentos, configurações)? Esta ação não pode ser desfeita.')) {
      LocalStorageUtils.clearProjectData();
      toast({
        title: "Dados do projeto limpos",
        description: "Documentos e configurações foram removidos. A página será recarregada.",
      });
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  const handleListStorage = () => {
    LocalStorageUtils.listAll();
    toast({
      title: "Dados listados",
      description: "Verifique o console do navegador para ver o conteúdo do localStorage.",
    });
  };

  const storageSize = LocalStorageUtils.getStorageSize();
  const storageSizeKB = Math.round(storageSize / 1024);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Gerenciamento de Storage
        </CardTitle>
        <CardDescription>
          Gerencie os dados armazenados localmente no navegador
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Tamanho atual do localStorage: {storageSizeKB} KB
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            variant="outline"
            onClick={handleListStorage}
            className="flex items-center gap-2"
          >
            <Database className="h-4 w-4" />
            Listar Dados
          </Button>

          <Button
            variant="destructive"
            onClick={handleClearProjectData}
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Limpar Projeto
          </Button>

          <Button
            variant="destructive"
            onClick={handleClearAll}
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Limpar Tudo
          </Button>
        </div>

        <div className="text-sm text-muted-foreground space-y-1">
          <p><strong>Listar Dados:</strong> Mostra o conteúdo atual no console</p>
          <p><strong>Limpar Projeto:</strong> Remove documentos e configurações do projeto</p>
          <p><strong>Limpar Tudo:</strong> Remove todos os dados do localStorage</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default StorageManager;
