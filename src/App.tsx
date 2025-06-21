
import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "./providers/ThemeProvider";
import { AuthProvider } from "./hooks/useAuth";
import { GlobalApiKeyProvider } from "./hooks/useGlobalApiKey";
import { router } from "./router";

const App = () => {
  return (
    <ThemeProvider defaultTheme="light">
      <TooltipProvider>
        <AuthProvider>
          <GlobalApiKeyProvider>
            <RouterProvider router={router} />
            <Toaster />
            <Sonner />
          </GlobalApiKeyProvider>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  );
};

export default App;
