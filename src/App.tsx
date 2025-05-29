
import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "./providers/ThemeProvider";
import { ApiKeyProvider } from "./context/ApiKeyProvider";
import Layout from "./components/layout/Layout";

const App = () => {
  return (
    <ThemeProvider defaultTheme="light">
      <ApiKeyProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Layout />
        </TooltipProvider>
      </ApiKeyProvider>
    </ThemeProvider>
  );
};

export default App;
