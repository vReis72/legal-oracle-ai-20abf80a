
import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "./providers/ThemeProvider";
import Layout from "./components/layout/Layout";
import { ApiKeyProvider } from "./context/ApiKeyContext";

const App = () => {
  return (
    <ThemeProvider defaultTheme="light">
      <TooltipProvider>
        <ApiKeyProvider>
          <Toaster />
          <Sonner />
          <Layout />
        </ApiKeyProvider>
      </TooltipProvider>
    </ThemeProvider>
  );
};

export default App;
