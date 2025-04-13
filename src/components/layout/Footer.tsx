
import React from 'react';
import { Leaf } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-eco-dark text-white py-6 px-4">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <Leaf className="h-5 w-5 mr-2" />
            <span className="font-serif font-bold">Legal Oracle AI</span>
          </div>
          <div className="text-sm text-eco-light/70">
            <p>© 2025 Legal Oracle AI. O seu Assistente Jurídico pessoal. By: K1nGs Data Mining & Artificial Intelligence.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
