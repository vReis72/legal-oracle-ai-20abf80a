
import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Outlet } from "react-router-dom";
import Layout from "./components/layout/Layout";
import { ApiKeyProvider } from "./context/ApiKeyContext";
import ApiKeyCheck from "./components/shared/ApiKeyCheck";

const App = () => {
  return (
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <ApiKeyProvider>
        <ApiKeyCheck>
          <Layout />
        </ApiKeyCheck>
      </ApiKeyProvider>
    </TooltipProvider>
  );
};

export default App;
