
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Dialog, DialogTrigger, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { FilePlus, Loader2, CheckCircle, ArrowRight, FileText, AlertTriangle } from "lucide-react";
import { Template } from "./types";

interface PecaFormProps {
  selectedTemplate: Template | null;
  novaPeca: {
    nome: string;
    templateId: string;
    campos: Record<string, string>;
  };
  isGenerating: boolean;
  onCampoChange: (campo: string, valor: string) => void;
  onNomeChange: (nome: string) => void;
  onGenerate: () => void;
  isCamposPreenchidos: () => boolean;
}

const PecaForm: React.FC<PecaFormProps> = ({
  selectedTemplate,
  novaPeca,
  isGenerating,
  onCampoChange,
  onNomeChange,
  onGenerate,
  isCamposPreenchidos
}) => {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Preencher Informações</CardTitle>
        <CardDescription>
          {selectedTemplate
            ? `Preencha para criar a peça "${selectedTemplate.nome}"`
            : "Selecione um modelo ao lado para começar"
          }
        </CardDescription>
      </CardHeader>
      {selectedTemplate ? (
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">
              Nome da Peça <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="Ex: Petição - Cliente Fulano"
              value={novaPeca.nome}
              onChange={e => onNomeChange(e.target.value)}
            />
          </div>
          <div className="space-y-4">
            {selectedTemplate.campos.map((campo, index) => (
              <div key={index}>
                <label className="text-sm font-medium mb-1 block">
                  {campo.nome} {campo.obrigatorio && <span className="text-red-500">*</span>}
                </label>
                {campo.tipo === "texto" && (
                  campo.nome.toLowerCase().includes("fundamentação") ||
                  campo.nome.toLowerCase().includes("fundamentos") ? (
                    <Textarea
                      placeholder={`Digite ${campo.nome.toLowerCase()}`}
                      value={novaPeca.campos[campo.nome] || ""}
                      onChange={e => onCampoChange(campo.nome, e.target.value)}
                      rows={4}
                    />
                  ) : (
                    <Input
                      placeholder={`Digite ${campo.nome.toLowerCase()}`}
                      value={novaPeca.campos[campo.nome] || ""}
                      onChange={e => onCampoChange(campo.nome, e.target.value)}
                    />
                  )
                )}
                {campo.tipo === "data" && (
                  <Input
                    type="date"
                    value={novaPeca.campos[campo.nome] || ""}
                    onChange={e => onCampoChange(campo.nome, e.target.value)}
                  />
                )}
                {campo.tipo === "numero" && (
                  <Input
                    type="number"
                    placeholder={`Digite ${campo.nome.toLowerCase()}`}
                    value={novaPeca.campos[campo.nome] || ""}
                    onChange={e => onCampoChange(campo.nome, e.target.value)}
                  />
                )}
                {campo.tipo === "opcao" && campo.opcoes && (
                  <Select
                    value={novaPeca.campos[campo.nome] || ""}
                    onValueChange={value => onCampoChange(campo.nome, value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={`Selecione ${campo.nome.toLowerCase()}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {campo.opcoes.map((opcao, i) => (
                        <SelectItem key={i} value={opcao}>{opcao}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            ))}
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button
                className="w-full bg-eco-primary hover:bg-eco-dark mt-4"
                disabled={!novaPeca.nome.trim() || !isCamposPreenchidos()}
              >
                <FilePlus className="h-4 w-4 mr-2" />
                Gerar Peça Jurídica
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Confirmar Geração de Peça</DialogTitle>
                <DialogDescription>
                  A peça será gerada segundo o modelo selecionado e os dados informados.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Detalhes da Peça</h4>
                  <div className="bg-muted p-3 rounded-md">
                    <p className="text-sm font-medium">{novaPeca.nome}</p>
                    <p className="text-xs text-muted-foreground">{selectedTemplate.nome}</p>
                  </div>
                </div>
                {isGenerating ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="flex flex-col items-center">
                      <Loader2 className="h-8 w-8 animate-spin text-eco-primary mb-4" />
                      <p className="text-sm font-medium">Gerando documento...</p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm">
                      Confira os dados antes de confirmar. O texto será gerado de forma genérica e estruturada para sua área.
                    </p>
                    <ul className="text-sm mt-2 space-y-1">
                      <li className="flex items-center">
                        <CheckCircle className="h-3 w-3 text-green-500 mr-2" />
                        Estrutura adaptada para qualquer área do Direito
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-3 w-3 text-green-500 mr-2" />
                        Documento editável e pronto para revisão
                      </li>
                    </ul>
                  </div>
                )}
              </div>
              <DialogFooter>
                {!isGenerating && (
                  <>
                    <Button variant="outline" className="w-full sm:w-auto">
                      Cancelar
                    </Button>
                    <Button
                      className="w-full sm:w-auto bg-eco-primary hover:bg-eco-dark"
                      onClick={onGenerate}
                    >
                      <ArrowRight className="h-4 w-4 mr-2" />
                      Confirmar e Gerar
                    </Button>
                  </>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      ) : (
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <FileText className="h-16 w-16 text-muted-foreground opacity-30 mb-4" />
          <h3 className="text-lg font-medium">Selecione um Modelo</h3>
          <p className="text-sm text-muted-foreground max-w-xs mt-2">
            Escolha um dos modelos disponíveis ao lado para começar a criar sua peça jurídica.
          </p>
          <AlertTriangle className="h-4 w-4 text-amber-500 mt-4" />
          <p className="text-xs text-muted-foreground mt-1">
            Campos marcados com <span className="text-red-500">*</span> são obrigatórios
          </p>
        </CardContent>
      )}
    </Card>
  );
};

export default PecaForm;
