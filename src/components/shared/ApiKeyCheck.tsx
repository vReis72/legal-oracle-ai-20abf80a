
import React from 'react';
import { useGlobalApiKey } from '@/hooks/useGlobalApiKey';
import { useAuth } from '@/hooks/useAuth';

interface ApiKeyCheckProps {
  children: React.ReactNode;
}

const ApiKeyCheck: React.FC<ApiKeyCheckProps> = ({ children }) => {
  const { hasValidGlobalKey, loading } = useGlobalApiKey();
  const { isAdmin, loading: authLoading } = useAuth();
  
  console.log('🔐 ApiKeyCheck: Estado:', {
    hasValidGlobalKey,
    loading,
    isAdmin,
    authLoading
  });

  // SEMPRE renderizar children - não bloquear o acesso
  return <>{children}</>;
};

export default ApiKeyCheck;
