
import React from 'react';
import { Button } from "@/components/ui/button";
import { Key, Check, AlertTriangle, Cloud } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface ApiKeyButtonProps {
  isPlaceholderKey: boolean;
  isEnvironmentKey: boolean;
  keyConfigured: boolean;
  buttonSize: "default" | "sm" | "lg" | "icon";
  onUpdateKey: () => void;
}

const ApiKeyButton: React.FC<ApiKeyButtonProps> = ({
  isPlaceholderKey,
  isEnvironmentKey,
  keyConfigured,
  buttonSize,
  onUpdateKey
}) => {
  const { toast } = useToast();

  const handleClick = () => {
    if (isEnvironmentKey) {
      toast({
        variant: "info",
        title: "API Key do Ambiente",
        description: "A chave API está configurada através de variáveis de ambiente (Railway).",
      });
      return;
    }
    onUpdateKey();
  };

  return (
    <div className="flex justify-end mb-4">
      <Button 
        variant={isPlaceholderKey ? "destructive" : (keyConfigured ? "outline" : "default")} 
        size={buttonSize} 
        onClick={handleClick}
        className="flex items-center gap-1 text-xs"
      >
        {isPlaceholderKey ? (
          <AlertTriangle className="h-3 w-3" />
        ) : isEnvironmentKey ? (
          <Cloud className="h-3 w-3 text-blue-600" />
        ) : (keyConfigured ? (
          <Check className="h-3 w-3" />
        ) : (
          <Key className="h-3 w-3" />
        ))}
        {isPlaceholderKey ? "API Inválida!" : (
          isEnvironmentKey ? "API Railway" : (
            keyConfigured ? "API Configurada" : "Configurar API"
          )
        )}
      </Button>
    </div>
  );
};

export default ApiKeyButton;
