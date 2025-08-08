
import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="border-b bg-white shadow-sm sticky top-0 z-50">
      <div className="eco-container">
        <div className="flex items-center justify-between h-14 md:h-16">
          <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
            <span className="text-lg md:text-xl font-serif font-bold text-eco-dark">
              Legal Oracle IA
            </span>
          </Link>
          
          {/* Simple Navigation */}
          <nav className="flex items-center space-x-6">
            <Link 
              to="/" 
              className="text-muted-foreground hover:text-eco-primary transition-colors text-sm md:text-base"
            >
              Chat IA
            </Link>
            <Link 
              to="/documentos" 
              className="text-muted-foreground hover:text-eco-primary transition-colors text-sm md:text-base"
            >
              Documentos
            </Link>
            <Link 
              to="/pecas" 
              className="text-muted-foreground hover:text-eco-primary transition-colors text-sm md:text-base"
            >
              Peças Jurídicas
            </Link>
            <Link 
              to="/settings"
              className="text-muted-foreground hover:text-eco-primary transition-colors text-sm md:text-base"
            >
              Settings
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
