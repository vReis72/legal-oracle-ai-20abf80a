
import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { GlobalApiKeyProvider } from "./hooks/useGlobalApiKey";
import { router } from "./router";

const App = () => {
  return (
    <div className="light">
      <TooltipProvider>
        <GlobalApiKeyProvider>
          <RouterProvider router={router} />
          <Sonner />
        </GlobalApiKeyProvider>
      </TooltipProvider>
    </div>
  );
};

export default App;
