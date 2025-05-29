
import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "./providers/ThemeProvider";
import { AuthProvider } from "./contexts/AuthContext";
import { ApiKeyProvider } from "./context/ApiKeyContext";
import { router } from './router';

const App = () => {
  return (
    <ThemeProvider defaultTheme="light">
      <AuthProvider>
        <TooltipProvider>
          <ApiKeyProvider>
            <Toaster />
            <Sonner />
            <RouterProvider router={router} />
          </ApiKeyProvider>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
