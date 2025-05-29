
import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { ApiKeyProvider } from "./context/ApiKeyContext"
import './index.css'

// Configurações globais
const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ApiKeyProvider>
        <RouterProvider router={router} />
        <Toaster richColors position="top-center" />
      </ApiKeyProvider>
    </QueryClientProvider>
  </React.StrictMode>,
)
