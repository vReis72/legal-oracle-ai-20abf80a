
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "./providers/ThemeProvider";
import { AuthProvider } from "./hooks/useAuth";
import { GlobalApiKeyProvider } from "./hooks/useGlobalApiKey";
import { router } from "./router";
import "./index.css";

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element not found");

createRoot(rootElement).render(
  <StrictMode>
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
  </StrictMode>
);
