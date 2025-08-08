
import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "./providers/ThemeProvider";
import { GlobalApiKeyProvider } from "./hooks/useGlobalApiKey";
import { router } from "./router";

const App = () => {
  return (
    <ThemeProvider defaultTheme="light">
      <TooltipProvider>
        <GlobalApiKeyProvider>
          <RouterProvider router={router} />
          <Sonner />
        </GlobalApiKeyProvider>
      </TooltipProvider>
    </ThemeProvider>
  );
};

export default App;
