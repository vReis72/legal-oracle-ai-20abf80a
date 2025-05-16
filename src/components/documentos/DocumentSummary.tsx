
import React, { useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface DocumentSummaryProps {
  summary: string;
  content: string;
}

const DocumentSummary: React.FC<DocumentSummaryProps> = ({ summary, content }) => {
  useEffect(() => {
    console.log("DocumentSummary - Props recebidas:");
    console.log("  Summary presente?", !!summary, "Tamanho:", summary?.length || 0);
    console.log("  Conteúdo presente?", !!content, "Tamanho:", content?.length || 0);
    console.log("  Primeiros 100 caracteres do conteúdo:", content?.substring(0, 100));
    console.log("  Últimos 100 caracteres do conteúdo:", content?.substring((content?.length || 0) - 100) || "");
  }, [summary, content]);

  if (!content) {
    console.log("DocumentSummary - Sem conteúdo para exibir");
    return <div className="p-4 bg-slate-100 rounded border">Nenhum conteúdo disponível para este documento.</div>;
  }
  
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
            <pre className="whitespace-pre-line prose prose-sm max-w-none bg-white p-4 border rounded overflow-auto max-h-[500px]">
              {content || "Nenhum texto capturado."}
            </pre>
          </div>
        </TabsContent>
        
        <TabsContent value="resumo">
          <div className="whitespace-pre-line prose prose-sm max-w-none">
            {summary || "Nenhum resumo disponível. Clique em 'Analisar' para gerar um resumo do documento."}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DocumentSummary;
