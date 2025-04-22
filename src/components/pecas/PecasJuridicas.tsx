
import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { modelosReais } from './modelosReais';
import { Template, Peca } from './types';
import TemplateList from './TemplateList';
import TemplateDetails from './TemplateDetails';
import PecaForm from './PecaForm';
import PecaList from './PecaList';
import PecaViewer from './PecaViewer';

// Função para gerar conteúdo básico, para customizar por template
function gerarConteudo(template: Template, campos: Record<string, string>) {
  return `Modelo de ${template.nome}

${template.campos.map(campo => `${campo.nome}: ${campos[campo.nome] || '[não preenchido]'}`).join('\n')}

[Conteúdo gerado automaticamente. Recomenda-se revisão manual e complementação.]`;
}

const PecasJuridicas = () => {
  const [templates] = useState<Template[]>(modelosReais);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [pecas, setPecas] = useState<Peca[]>([]);
  const [novaPeca, setNovaPeca] = useState<{
    nome: string;
    templateId: string;
    campos: Record<string, string>;
  }>({
    nome: '',
    templateId: '',
    campos: {}
  });
  const [selectedPeca, setSelectedPeca] = useState<Peca | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string>('');

  const handleSelectTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(template);
      setNovaPeca(prev => ({
        ...prev,
        templateId: templateId,
        campos: {}
      }));
    }
  };

  const handleCampoChange = (campo: string, valor: string) => {
    setNovaPeca(prev => ({
      ...prev,
      campos: {
        ...prev.campos,
        [campo]: valor
      }
    }));
  };

  const handleNomeChange = (nome: string) => {
    setNovaPeca(prev => ({
      ...prev,
      nome
    }));
  };

  const handleCreatePeca = () => {
    setIsGenerating(true);

    setTimeout(() => {
      if (!selectedTemplate) return;

      const newContent = gerarConteudo(selectedTemplate, novaPeca.campos);

      const newPeca: Peca = {
        id: Date.now().toString(),
        nome: novaPeca.nome,
        template: novaPeca.templateId,
        dataCriacao: new Date(),
        status: 'concluida',
        conteudo: newContent
      };

      setPecas(prev => [...prev, newPeca]);
      setSelectedPeca(newPeca);
      setGeneratedContent(newContent);
      setIsGenerating(false);

      setNovaPeca({
        nome: '',
        templateId: '',
        campos: {}
      });
      setSelectedTemplate(null);
    }, 2200);
  };

  const handleEditPeca = (pecaId: string) => {
    const peca = pecas.find(p => p.id === pecaId);
    if (peca) {
      setSelectedPeca(peca);
      setGeneratedContent(peca.conteudo || '');
    }
  };

  const handleDeletePeca = (pecaId: string) => {
    setPecas(prev => prev.filter(p => p.id !== pecaId));
    if (selectedPeca?.id === pecaId) {
      setSelectedPeca(null);
      setGeneratedContent('');
    }
  };

  const isCamposPreenchidos = () => {
    if (!selectedTemplate) return false;
    const camposObrigatorios = selectedTemplate.campos
      .filter(c => c.obrigatorio)
      .map(c => c.nome);
    return camposObrigatorios.every(campo =>
      novaPeca.campos[campo] && novaPeca.campos[campo].trim() !== ''
    );
  };

  return (
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
                onSelect={handleSelectTemplate}
              />
              <TemplateDetails template={selectedTemplate} />
            </div>
            <div className="md:col-span-2">
              <PecaForm
                selectedTemplate={selectedTemplate}
                novaPeca={novaPeca}
                isGenerating={isGenerating}
                onCampoChange={handleCampoChange}
                onNomeChange={handleNomeChange}
                onGenerate={handleCreatePeca}
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
                onSelect={handleEditPeca}
              />
            </div>
            <div className="md:col-span-2">
              <PecaViewer
                peca={selectedPeca}
                generatedContent={generatedContent}
                onEdit={handleEditPeca}
                onDelete={handleDeletePeca}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PecasJuridicas;
