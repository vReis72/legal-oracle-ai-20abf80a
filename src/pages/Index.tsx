
import React from 'react';
import ChatInterface from '@/components/ai/ChatInterface';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Scale, BookOpen, FileText, MessageSquare, FileCode } from "lucide-react";
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Link to="/" className="block">
          <Card className="h-full hover:shadow-md transition-all">
            <CardHeader className="pb-2">
              <MessageSquare className="h-6 w-6 text-eco-primary mb-2" />
              <CardTitle>Assistente</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Tire suas dúvidas, receba orientações, dicas e sugestões na área do Direito, conversando em linguagem natural com seu assistente jurídico pessoal
              </CardDescription>
            </CardContent>
          </Card>
        </Link>
        
        <Link to="/jurisprudencia" className="block">
          <Card className="h-full hover:shadow-md transition-all">
            <CardHeader className="pb-2">
              <BookOpen className="h-6 w-6 text-eco-primary mb-2" />
              <CardTitle>Jurisprudência</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Peça para seu assistente jurídico pessoal pesquisar e encontrar precedentes judiciais relevantes. Tudo muito simples e rápido
              </CardDescription>
            </CardContent>
          </Card>
        </Link>
        
        <Link to="/documentos" className="block">
          <Card className="h-full hover:shadow-md transition-all">
            <CardHeader className="pb-2">
              <FileText className="h-6 w-6 text-eco-primary mb-2" />
              <CardTitle>Documentos</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Deixe a IA trabalhar para você. Suba seus arquivos e peça para que o seu assistente jurídico leia, analise e gere resumos a partir dos seus documentos
              </CardDescription>
            </CardContent>
          </Card>
        </Link>

        <Link to="/pecas" className="block">
          <Card className="h-full hover:shadow-md transition-all">
            <CardHeader className="pb-2">
              <FileCode className="h-6 w-6 text-eco-primary mb-2" />
              <CardTitle>Peças Jurídicas</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Crie suas peças jurídicas a partir de modelos prontos, com auxílio de Inteligência Artificial
              </CardDescription>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
};

export default Index;
