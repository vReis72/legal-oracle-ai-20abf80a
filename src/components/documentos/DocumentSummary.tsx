
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface DocumentSummaryProps {
  summary: string;
  content?: string;
}

const DocumentSummary: React.FC<DocumentSummaryProps> = ({ summary, content }) => {
  if (!summary && !content) return null;
  
  return (
    <div className="border rounded-lg p-4">
      <h3 className="text-lg font-medium mb-3">Documento</h3>
      
      <Tabs defaultValue="conteudo" className="w-full">
        <TabsList>
          <TabsTrigger value="conteudo">Texto Capturado</TabsTrigger>
          <TabsTrigger value="resumo">Resumo</TabsTrigger>
        </TabsList>
        
        <TabsContent value="conteudo">
          <div className="p-3 border rounded mt-3 bg-slate-50">
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Texto original do documento:</h4>
            <div className="whitespace-pre-line prose prose-sm max-w-none bg-white p-4 border rounded overflow-auto max-h-[500px]">
              {content || "Nenhum texto capturado."}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="resumo">
          <div className="whitespace-pre-line prose prose-sm max-w-none">
            {summary.trim()}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DocumentSummary;
