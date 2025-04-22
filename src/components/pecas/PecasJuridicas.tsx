
import React from 'react';
import { usePecasJuridicas } from './hooks/usePecasJuridicas';
import PecasTabsLayout from './layout/PecasTabsLayout';

const PecasJuridicas = () => {
  const {
    templates,
    selectedTemplate,
    novaPeca,
    isGenerating,
    handleSelectTemplate,
    handleCampoChange,
    handleNomeChange,
    handleCreatePeca,
    isCamposPreenchidos,
    pecas,
    selectedPeca,
    handleEditPeca,
    handleDeletePeca,
    generatedContent,
  } = usePecasJuridicas();

  return (
    <PecasTabsLayout
      templates={templates}
      selectedTemplate={selectedTemplate}
      onSelectTemplate={handleSelectTemplate}
      novaPeca={novaPeca}
      isGenerating={isGenerating}
      onCampoChange={handleCampoChange}
      onNomeChange={handleNomeChange}
      onGenerate={handleCreatePeca}
      isCamposPreenchidos={isCamposPreenchidos}
      pecas={pecas}
      selectedPeca={selectedPeca}
      onEditPeca={handleEditPeca}
      onDeletePeca={handleDeletePeca}
      generatedContent={generatedContent}
    />
  );
};

export default PecasJuridicas;
