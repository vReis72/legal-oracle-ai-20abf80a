
import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import ApiKeyCheck from '../shared/ApiKeyCheck';

const Layout = () => {
  return (
    <ApiKeyCheck>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow py-8">
          <Outlet />
        </main>
        <Footer />
      </div>
    </ApiKeyCheck>
  );
};

export default Layout;
