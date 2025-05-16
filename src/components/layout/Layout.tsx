
import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import ApiKeyCheck from '../shared/ApiKeyCheck';

const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <ApiKeyCheck>
        <Header />
        <main className="flex-grow py-8">
          <Outlet />
        </main>
        <Footer />
      </ApiKeyCheck>
    </div>
  );
};

export default Layout;
