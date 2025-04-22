
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";
import { Template, Peca } from "./types";
import { cn } from "@/lib/utils";

interface PecaListProps {
  pecas: Peca[];
  templates: Template[];
  selectedPeca: Peca | null;
  onSelect: (pecaId: string) => void;
}

const PecaList: React.FC<PecaListProps> = ({
  pecas,
  templates,
  selectedPeca,
  onSelect,
}) => (
  <Card className="h-full">
    <CardHeader>
      <CardTitle>Minhas Peças Jurídicas</CardTitle>
      <CardDescription>
        {pecas.length} {pecas.length === 1 ? 'peça criada' : 'peças criadas'}
      </CardDescription>
    </CardHeader>
    <CardContent className="p-0">
      <ScrollArea className="h-[calc(100vh-22rem)]">
        <div className="space-y-2 p-4">
          {pecas.map(peca => {
            const template = templates.find(t => t.id === peca.template);
            return (
              <div
                key={peca.id}
                className={cn(
                  "p-3 border rounded-md cursor-pointer transition-all",
                  selectedPeca?.id === peca.id
                    ? "border-eco-primary bg-eco-muted/30"
                    : "hover:bg-muted/50"
                )}
                onClick={() => onSelect(peca.id)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-sm">{peca.nome}</h4>
                    <p className="text-xs text-muted-foreground">
                      {template?.nome || "Modelo"}
                    </p>
                  </div>
                  <Badge variant={peca.status === "concluida" ? "default" : "outline"}>
                    {peca.status === "concluida" ? "Concluída" : "Rascunho"}
                  </Badge>
                </div>
                <div className="flex text-xs text-muted-foreground mt-2 items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  {peca.dataCriacao.toLocaleDateString("pt-BR")}
                </div>
              </div>
            );
          })}
          {pecas.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-muted-foreground">Nenhuma peça encontrada.</p>
              <p className="text-sm">Utilize a aba "Criar Peça Jurídica" para criar sua primeira peça.</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </CardContent>
  </Card>
);

export default PecaList;
