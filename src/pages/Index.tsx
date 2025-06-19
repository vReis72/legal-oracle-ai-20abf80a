
import React from 'react';
import ChatInterface from '@/components/ai/ChatInterface';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Scale, MessageSquare } from "lucide-react";
import { Link } from 'react-router-dom';

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
      
      <div className="mb-4">
        <h2 className="text-2xl font-serif font-semibold mb-2 text-eco-dark">
          Recursos Disponíveis
        </h2>
        <p className="text-muted-foreground">
          Explore todas as ferramentas do Legal Oracle para otimizar sua atuação jurídica
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mb-8 max-w-md mx-auto">
        <Link to="/" className="block">
          <Card className="h-full hover:shadow-md transition-all">
            <CardHeader className="pb-2">
              <MessageSquare className="h-6 w-6 text-eco-primary mb-2" />
              <CardTitle>Assistente Jurídico</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Tire suas dúvidas, receba orientações, pesquise jurisprudência e obtenha sugestões na área do Direito, conversando em linguagem natural com seu assistente jurídico pessoal
              </CardDescription>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
};

export default Index;
