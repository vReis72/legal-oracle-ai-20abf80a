
import { createBrowserRouter } from 'react-router-dom';
import Index from '@/pages/Index';
import PecasJuridicas from '@/pages/PecasJuridicas';
import Documentos from '@/pages/Documentos';
import Settings from '@/pages/Settings';
import Auth from '@/pages/Auth';
import NotFound from '@/pages/NotFound';
import Layout from '@/components/layout/Layout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: '/auth',
    element: <Auth />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Index />,
      },
      {
        path: 'pecas-juridicas',
        element: <PecasJuridicas />,
      },
      {
        path: 'documentos',
        element: <Documentos />,
      },
      {
        path: 'settings',
        element: <Settings />,
      },
    ],
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);
