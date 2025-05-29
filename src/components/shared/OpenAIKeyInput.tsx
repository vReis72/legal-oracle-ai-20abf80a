
import React, { useState, useEffect } from 'react';
import { useApiKey } from '@/context/ApiKeyContext';
import { hasApiKey } from '@/services/apiKeyService';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from 'lucide-react';
import ApiKeyButton from './ApiKeyButton';
import ApiKeyDialog from './ApiKeyDialog';
import { OpenAIKeyInputProps } from './types/openAIKeyInputTypes';

const OpenAIKeyInput: React.FC<OpenAIKeyInputProps> = ({ 
  onKeySubmit, 
  forceOpen = false, 
  buttonVariant = "outline", 
  buttonSize = "sm" 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { isKeyConfigured, isPlaceholderKey, isEnvironmentKey } = useApiKey();
  const [showError, setShowError] = useState(false);

  const keyConfigured = (hasApiKey() && isKeyConfigured && !isPlaceholderKey) || isEnvironmentKey;

  useEffect(() => {
    if (forceOpen && (!keyConfigured || isPlaceholderKey) && !isEnvironmentKey) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
    
    setShowError(isPlaceholderKey && !isEnvironmentKey);
  }, [forceOpen, keyConfigured, isPlaceholderKey, isEnvironmentKey]);

  const handleUpdateKey = () => {
    setIsOpen(true);
  };

  if (forceOpen && keyConfigured) {
    return null;
  }

  return (
    <>
      {showError && !forceOpen && (
        <Alert variant="destructive" className="mb-3">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            A chave API atual é inválida. Por favor, configure uma nova chave.
          </AlertDescription>
        </Alert>
      )}
      
      <ApiKeyDialog
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        onKeySubmit={onKeySubmit}
        forceOpen={forceOpen}
        keyConfigured={keyConfigured}
      />
      
      {!forceOpen && (
        <ApiKeyButton
          isPlaceholderKey={isPlaceholderKey}
          isEnvironmentKey={isEnvironmentKey}
          keyConfigured={keyConfigured}
          buttonSize={buttonSize}
          onUpdateKey={handleUpdateKey}
        />
      )}
    </>
  );
};

export default OpenAIKeyInput;
