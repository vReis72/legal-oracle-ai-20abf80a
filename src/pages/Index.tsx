
import React from 'react';
import ChatInterface from '@/components/ai/ChatInterface';
import { Scale } from "lucide-react";

const Index = () => {
  return (
    <div className="eco-container">
      <div className="max-w-3xl mx-auto text-center mb-10">
        <h1 className="text-4xl font-serif font-bold mb-4 text-eco-dark">
          <Scale className="inline-block mr-2 mb-1 h-10 w-10 text-eco-primary" />
          Legal Oracle AI
        </h1>
        <p className="text-xl text-muted-foreground">
          Seu assistente de IA especializado em direito
        </p>
      </div>
      
      <div className="mb-10">
        <ChatInterface />
      </div>
    </div>
  );
};

export default Index;
