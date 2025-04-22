
import React from "react";
import { Card, CardHeader, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Copy, Trash2, Download, Save, FileText } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Peca } from "./types";

interface PecaViewerProps {
  peca: Peca | null;
  generatedContent: string;
  onEdit: (pecaId: string) => void;
  onDelete: (pecaId: string) => void;
}

const PecaViewer: React.FC<PecaViewerProps> = ({
  peca,
  generatedContent,
  onEdit,
  onDelete,
}) => {
  if (!peca) {
    return (
      <Card className="h-full flex flex-col items-center justify-center text-center p-8">
        <FileText className="h-16 w-16 text-muted-foreground opacity-30 mb-4" />
        <h3 className="text-lg font-medium">Selecione uma Peça</h3>
        <p className="text-sm text-muted-foreground max-w-sm mt-2">
          Escolha uma peça jurídica ao lado para visualizar seu conteúdo.
        </p>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <div>
          <CardTitle>{peca.nome}</CardTitle>
          <CardDescription>
            Criada em {peca.dataCriacao.toLocaleDateString('pt-BR')}
          </CardDescription>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={() => onEdit(peca.id)}>
            <Edit className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Editar</span>
          </Button>
          <Button variant="outline" size="sm">
            <Copy className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Duplicar</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-red-500 hover:text-red-700"
            onClick={() => onDelete(peca.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-grow p-0 relative">
        <div className="absolute inset-0 flex flex-col">
          <div className="bg-muted/30 p-2 border-t border-b flex items-center justify-between">
            <div className="flex space-x-2">
              <Button variant="ghost" size="sm" className="h-7 px-2">
                <Download className="h-4 w-4 mr-1" />
                <span className="text-xs">Baixar</span>
              </Button>
              <Button variant="ghost" size="sm" className="h-7 px-2">
                <Copy className="h-4 w-4 mr-1" />
                <span className="text-xs">Copiar</span>
              </Button>
            </div>
            <div>
              <Button variant="ghost" size="sm" className="h-7 px-2">
                <Save className="h-4 w-4 mr-1" />
                <span className="text-xs">Salvar</span>
              </Button>
            </div>
          </div>
          <ScrollArea className="flex-grow p-4">
            <div className="bg-white rounded-md p-6 font-serif text-sm leading-relaxed whitespace-pre-line">
              {generatedContent || "Carregando conteúdo..."}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
};

export default PecaViewer;
