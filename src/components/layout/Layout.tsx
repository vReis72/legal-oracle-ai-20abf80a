
import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { useAuth } from '@/contexts/AuthContext';

const Layout = () => {
  const { user } = useAuth();

  if (!user) {
    return null; // ProtectedRoute já gerencia redirecionamento
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow py-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
