
import React from 'react';

interface ApiKeyCheckProps {
  children: React.ReactNode;
}

const ApiKeyCheck: React.FC<ApiKeyCheckProps> = ({ children }) => {
  // Simplesmente renderizar children - não bloquear acesso
  return <>{children}</>;
};

export default ApiKeyCheck;
