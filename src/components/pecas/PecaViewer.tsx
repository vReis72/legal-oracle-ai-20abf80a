
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
      <Card className="h-full flex flex-col items-center justify-center text-center p-6 md:p-8">
        <FileText className="h-12 w-12 md:h-16 md:w-16 text-muted-foreground opacity-30 mb-4" />
        <h3 className="text-base md:text-lg font-medium">Selecione uma Peça</h3>
        <p className="text-sm text-muted-foreground max-w-sm mt-2">
          Escolha uma peça jurídica ao lado para visualizar seu conteúdo.
        </p>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <div className="min-w-0 flex-1">
          <CardTitle className="text-lg md:text-xl truncate">{peca.nome}</CardTitle>
          <CardDescription className="text-sm">
            Criada em {peca.dataCriacao.toLocaleDateString('pt-BR')}
          </CardDescription>
        </div>
        <div className="flex space-x-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={() => onEdit(peca.id)} className="text-xs md:text-sm">
            <Edit className="h-3 w-3 md:h-4 md:w-4 mr-1" />
            <span className="hidden sm:inline">Editar</span>
          </Button>
          <Button variant="outline" size="sm" className="text-xs md:text-sm">
            <Copy className="h-3 w-3 md:h-4 md:w-4 mr-1" />
            <span className="hidden sm:inline">Duplicar</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-red-500 hover:text-red-700 text-xs md:text-sm"
            onClick={() => onDelete(peca.id)}
          >
            <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-grow p-0 relative">
        <div className="absolute inset-0 flex flex-col">
          <div className="bg-muted/30 p-2 border-t border-b flex items-center justify-between">
            <div className="flex space-x-1 md:space-x-2">
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                <Download className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                <span className="hidden sm:inline">Baixar</span>
              </Button>
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                <Copy className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                <span className="hidden sm:inline">Copiar</span>
              </Button>
            </div>
            <div>
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                <Save className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                <span className="hidden sm:inline">Salvar</span>
              </Button>
            </div>
          </div>
          <ScrollArea className="flex-grow p-3 md:p-4">
            <div className="bg-white rounded-md p-4 md:p-6 font-serif text-xs md:text-sm leading-relaxed whitespace-pre-line">
              {generatedContent || "Carregando conteúdo..."}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
};

export default PecaViewer;
