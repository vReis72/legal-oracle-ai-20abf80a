
import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import Index from './pages/Index';
import Jurisprudencia from './pages/Jurisprudencia';
import Alertas from './pages/Alertas';
import PecasJuridicas from './pages/PecasJuridicas';
import Documentos from './pages/Documentos';
import NotFound from './pages/NotFound';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <NotFound />,
    children: [
      {
        index: true,
        element: <Index />
      },
      {
        path: 'jurisprudencia',
        element: <Jurisprudencia />
      },
      {
        path: 'documentos',
        element: <Documentos />
      },
      {
        path: 'alertas',
        element: <Alertas />
      },
      {
        path: 'pecas',
        element: <PecasJuridicas />
      }
    ]
  }
]);
