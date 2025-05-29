
import React, { useState, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Template } from './types';
import CategoryFilter from './CategoryFilter';

interface TemplateListProps {
  templates: Template[];
  selectedTemplate: Template | null;
  onSelect: (templateId: string) => void;
}

const TemplateList: React.FC<TemplateListProps> = ({ templates, selectedTemplate, onSelect }) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Extrair categorias únicas e ordenar alfabeticamente
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(templates.map(t => t.categoria))];
    return uniqueCategories.sort();
  }, [templates]);

  // Filtrar templates por categoria selecionada
  const filteredTemplates = useMemo(() => {
    if (!selectedCategory) return templates;
    return templates.filter(t => t.categoria === selectedCategory);
  }, [templates, selectedCategory]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Modelos de Peças</CardTitle>
        <CardDescription>
          Selecione um modelo conforme a área ou o tipo de processo
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onCategorySelect={setSelectedCategory}
          templateCount={filteredTemplates.length}
        />
        
        <ScrollArea className="h-[calc(100vh-32rem)]">
          <div className="space-y-1">
            {filteredTemplates.map(template => (
              <div
                key={template.id}
                className={cn(
                  "p-3 border rounded-md cursor-pointer transition-all",
                  selectedTemplate?.id === template.id
                    ? "border-eco-primary bg-eco-muted/30"
                    : "hover:bg-muted/50"
                )}
                onClick={() => onSelect(template.id)}
              >
                <div className="flex justify-between items-center">
                  <h4 className="font-medium text-sm">{template.nome}</h4>
                  <Badge variant="outline">{template.categoria}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {template.descricao}
                </p>
              </div>
            ))}
            
            {filteredTemplates.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p>Nenhum modelo encontrado para esta categoria.</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default TemplateList;
