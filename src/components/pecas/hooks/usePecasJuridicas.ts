
import { useState } from 'react';
import { modelosReais } from '../modelosReais';
import type { Template, Peca } from '../types';

// Função geradora do conteúdo da peça
function gerarConteudo(template: Template, campos: Record<string, string>) {
  return `Modelo de ${template.nome}

${template.campos.map(campo => `${campo.nome}: ${campos[campo.nome] || '[não preenchido]'}`).join('\n')}

[Conteúdo gerado automaticamente. Recomenda-se revisão manual e complementação.]`;
}

export function usePecasJuridicas() {
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

  // Selecionar template
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

  // Alterar campos
  const handleCampoChange = (campo: string, valor: string) => {
    setNovaPeca(prev => ({
      ...prev,
      campos: {
        ...prev.campos,
        [campo]: valor
      }
    }));
  };

  // Alterar nome da peça
  const handleNomeChange = (nome: string) => {
    setNovaPeca(prev => ({
      ...prev,
      nome
    }));
  };

  // Criar nova peça
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

  // Editar peça existente
  const handleEditPeca = (pecaId: string) => {
    const peca = pecas.find(p => p.id === pecaId);
    if (peca) {
      setSelectedPeca(peca);
      setGeneratedContent(peca.conteudo || '');
    }
  };

  // Deletar peça
  const handleDeletePeca = (pecaId: string) => {
    setPecas(prev => prev.filter(p => p.id !== pecaId));
    if (selectedPeca?.id === pecaId) {
      setSelectedPeca(null);
      setGeneratedContent('');
    }
  };

  // Validação de campos obrigatórios
  const isCamposPreenchidos = () => {
    if (!selectedTemplate) return false;
    const camposObrigatorios = selectedTemplate.campos
      .filter(c => c.obrigatorio)
      .map(c => c.nome);
    return camposObrigatorios.every(campo =>
      novaPeca.campos[campo] && novaPeca.campos[campo].trim() !== ''
    );
  };

  return {
    templates,
    selectedTemplate,
    setSelectedTemplate,
    pecas,
    setPecas,
    novaPeca,
    setNovaPeca,
    selectedPeca,
    setSelectedPeca,
    isGenerating,
    setIsGenerating,
    generatedContent,
    setGeneratedContent,
    handleSelectTemplate,
    handleCampoChange,
    handleNomeChange,
    handleCreatePeca,
    handleEditPeca,
    handleDeletePeca,
    isCamposPreenchidos,
  };
}
