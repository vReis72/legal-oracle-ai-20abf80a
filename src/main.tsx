
import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from './providers/ThemeProvider'
import { Toaster } from 'sonner'
import { preloadPdfWorker } from './utils/pdf/pdfWorkerConfig'
import './index.css'

// Configurações globais
const queryClient = new QueryClient()

// Pré-carrega o worker do PDF.js em nível global para estar disponível em toda a aplicação
preloadPdfWorker();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <Toaster richColors position="top-center" />
      </QueryClientProvider>
    </ThemeProvider>
  </React.StrictMode>,
)
