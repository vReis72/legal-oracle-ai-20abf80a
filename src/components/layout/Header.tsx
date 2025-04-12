
import React from 'react';
import { Link } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, BookOpen, FileText, MessageSquare, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

const Header = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <header className="bg-eco-primary text-white py-4 px-6 sticky top-0 z-50 shadow-md">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        <div className="flex items-center mb-4 md:mb-0">
          <Scale className="h-8 w-8 mr-2" />
          <Link to="/" className="text-2xl font-serif font-bold">Legal Oracle AI</Link>
        </div>
        
        <Tabs value={currentPath} className="w-full md:w-auto">
          <TabsList className="bg-eco-dark/30 w-full md:w-auto grid grid-cols-5 md:grid-cols-5">
            <TabsTrigger value="/" asChild>
              <Link to="/" className={cn("flex items-center justify-center", currentPath === "/" && "bg-white/10")}>
                <MessageSquare className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Assistente</span>
              </Link>
            </TabsTrigger>
            <TabsTrigger value="/jurisprudencia" asChild>
              <Link to="/jurisprudencia" className={cn("flex items-center justify-center", currentPath === "/jurisprudencia" && "bg-white/10")}>
                <BookOpen className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Jurisprudência</span>
              </Link>
            </TabsTrigger>
            <TabsTrigger value="/documentos" asChild>
              <Link to="/documentos" className={cn("flex items-center justify-center", currentPath === "/documentos" && "bg-white/10")}>
                <FileText className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Documentos</span>
              </Link>
            </TabsTrigger>
            <TabsTrigger value="/alertas" asChild>
              <Link to="/alertas" className={cn("flex items-center justify-center", currentPath === "/alertas" && "bg-white/10")}>
                <Bell className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Alertas</span>
              </Link>
            </TabsTrigger>
            <TabsTrigger value="/pecas" asChild>
              <Link to="/pecas" className={cn("flex items-center justify-center", currentPath === "/pecas" && "bg-white/10")}>
                <Scale className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Peças Jurídicas</span>
              </Link>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </header>
  );
};

export default Header;
