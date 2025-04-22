
import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import TemplateList from "../TemplateList";
import TemplateDetails from "../TemplateDetails";
import PecaForm from "../PecaForm";
import PecaList from "../PecaList";
import PecaViewer from "../PecaViewer";
import type { Template, Peca } from "../types";

// Props esperadas
interface PecasTabsLayoutProps {
  templates: Template[];
  selectedTemplate: Template | null;
  onSelectTemplate: (id: string) => void;
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
  pecas: Peca[];
  selectedPeca: Peca | null;
  onEditPeca: (pecaId: string) => void;
  onDeletePeca: (pecaId: string) => void;
  generatedContent: string;
}

const PecasTabsLayout: React.FC<PecasTabsLayoutProps> = ({
  templates,
  selectedTemplate,
  onSelectTemplate,
  novaPeca,
  isGenerating,
  onCampoChange,
  onNomeChange,
  onGenerate,
  isCamposPreenchidos,
  pecas,
  selectedPeca,
  onEditPeca,
  onDeletePeca,
  generatedContent,
}) => (
  <div className="flex flex-col h-full">
    <Tabs defaultValue="criar" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="criar">Criar Peça Jurídica</TabsTrigger>
        <TabsTrigger value="minhas">Minhas Peças</TabsTrigger>
      </TabsList>
      <TabsContent value="criar" className="space-y-4 mt-2">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1 space-y-4">
            <TemplateList
              templates={templates}
              selectedTemplate={selectedTemplate}
              onSelect={onSelectTemplate}
            />
            <TemplateDetails template={selectedTemplate} />
          </div>
          <div className="md:col-span-2">
            <PecaForm
              selectedTemplate={selectedTemplate}
              novaPeca={novaPeca}
              isGenerating={isGenerating}
              onCampoChange={onCampoChange}
              onNomeChange={onNomeChange}
              onGenerate={onGenerate}
              isCamposPreenchidos={isCamposPreenchidos}
            />
          </div>
        </div>
      </TabsContent>
      <TabsContent value="minhas" className="mt-2">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100vh-16rem)]">
          <div className="md:col-span-1">
            <PecaList
              pecas={pecas}
              templates={templates}
              selectedPeca={selectedPeca}
              onSelect={onEditPeca}
            />
          </div>
          <div className="md:col-span-2">
            <PecaViewer
              peca={selectedPeca}
              generatedContent={generatedContent}
              onEdit={onEditPeca}
              onDelete={onDeletePeca}
            />
          </div>
        </div>
      </TabsContent>
    </Tabs>
  </div>
);

export default PecasTabsLayout;
