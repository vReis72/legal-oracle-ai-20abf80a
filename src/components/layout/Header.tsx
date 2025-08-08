
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Scale, Settings, Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const Header = () => {
  const NavLinks = () => (
    <>
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
    </>
  );

  return (
    <header className="border-b bg-white shadow-sm sticky top-0 z-50">
      <div className="eco-container">
        <div className="flex items-center justify-between h-14 md:h-16">
          <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
            <Scale className="h-6 w-6 md:h-8 md:w-8 text-eco-primary" />
            <span className="text-lg md:text-xl font-serif font-bold text-eco-dark">
              Legal Oracle IA
            </span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <NavLinks />
          </nav>

          <div className="flex items-center space-x-2 md:space-x-4">
            {/* Mobile Navigation */}
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-64">
                  <div className="flex flex-col space-y-4 mt-8">
                    <NavLinks />
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            <Link to="/settings">
              <Button variant="ghost" size="sm" className="flex items-center space-x-1 md:space-x-2">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline text-sm md:text-base">
                  Configurações
                </span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
