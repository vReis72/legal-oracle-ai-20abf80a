
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Template } from './types';

interface TemplateListProps {
  templates: Template[];
  selectedTemplate: Template | null;
  onSelect: (templateId: string) => void;
}

const TemplateList: React.FC<TemplateListProps> = ({ templates, selectedTemplate, onSelect }) => (
  <Card>
    <CardHeader>
      <CardTitle>Modelos de Peças</CardTitle>
      <CardDescription>
        Selecione um modelo conforme a área ou o tipo de processo
      </CardDescription>
    </CardHeader>
    <CardContent className="p-0">
      <ScrollArea className="h-[calc(100vh-28rem)]">
        <div className="space-y-1 p-4">
          {templates.map(template => (
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
        </div>
      </ScrollArea>
    </CardContent>
  </Card>
);

export default TemplateList;
