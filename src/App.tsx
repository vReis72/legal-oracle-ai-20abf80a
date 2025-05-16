
import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Outlet } from "react-router-dom";
import Layout from "./components/layout/Layout";
import { ApiKeyProvider } from "./context/ApiKeyContext";

const App = () => {
  return (
    <TooltipProvider>
      <ApiKeyProvider>
        <Toaster />
        <Sonner />
        <Layout />
      </ApiKeyProvider>
    </TooltipProvider>
  );
};

export default App;
