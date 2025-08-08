
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { preloadPdfWorker } from "./utils/pdf/pdfWorkerConfig";

// Pré-carregar o PDF worker no início da aplicação
preloadPdfWorker();

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element not found");

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);
