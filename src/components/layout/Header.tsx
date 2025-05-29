
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Scale, FileText, Settings, LogOut, User, Shield } from 'lucide-react';

const Header = () => {
  const location = useLocation();
  const { profile, signOut } = useAuth();

  const navigation = [
    { name: 'Início', href: '/', icon: Scale },
    { name: 'Peças Jurídicas', href: '/pecas-juridicas', icon: FileText },
    { name: 'Documentos', href: '/documentos', icon: FileText },
    { name: 'Configurações', href: '/settings', icon: Settings },
  ];

  const isActivePath = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Scale className="h-8 w-8 text-eco-primary" />
              <span className="ml-2 text-xl font-bold text-eco-dark">Legal Oracle</span>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                      isActivePath(item.href)
                        ? 'border-eco-primary text-eco-primary'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">{profile?.full_name || profile?.email}</span>
                  {profile?.is_admin && <Shield className="h-4 w-4 text-blue-600" />}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="flex items-center">
                    <Settings className="h-4 w-4 mr-2" />
                    Configurações
                  </Link>
                </DropdownMenuItem>
                {profile?.is_admin && (
                  <DropdownMenuItem asChild>
                    <Link to="/settings" className="flex items-center text-blue-600">
                      <Shield className="h-4 w-4 mr-2" />
                      Painel Admin
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut} className="text-red-600">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
