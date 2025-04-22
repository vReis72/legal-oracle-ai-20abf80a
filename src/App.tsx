
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Index from "./pages/Index";
import Jurisprudencia from "./pages/Jurisprudencia";
import Documentos from "./pages/Documentos";
import Alertas from "./pages/Alertas";
import PecasJuridicas from "./pages/PecasJuridicas";
import NotFound from "./pages/NotFound";
import { ApiKeyProvider } from "./context/ApiKeyContext";
import React, { useState } from "react";

const App = () => {
  // Move the QueryClient initialization inside the component
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <ApiKeyProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Index />} />
                <Route path="/jurisprudencia" element={<Jurisprudencia />} />
                <Route path="/documentos" element={<Documentos />} />
                <Route path="/alertas" element={<Alertas />} />
                <Route path="/pecas" element={<PecasJuridicas />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ApiKeyProvider>
    </QueryClientProvider>
  );
};

export default App;
