
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Template } from "./types";

interface TemplateDetailsProps {
  template: Template | null;
}

const TemplateDetails: React.FC<TemplateDetailsProps> = ({ template }) => {
  if (!template) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Detalhes do Modelo</CardTitle>
      </CardHeader>
      <CardContent>
        <h3 className="font-medium mb-2">{template.nome}</h3>
        <p className="text-sm text-muted-foreground mb-4">{template.descricao}</p>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="campos">
            <AccordionTrigger className="text-sm">
              Campos Necessários ({template.campos.length})
            </AccordionTrigger>
            <AccordionContent>
              <ul className="space-y-1 text-sm">
                {template.campos.map((campo, idx) => (
                  <li key={idx} className="flex items-center">
                    <span className={campo.obrigatorio ? "text-red-500 mr-1" : "mr-1"}>
                      {campo.obrigatorio ? "*" : ""}
                    </span>
                    {campo.nome}
                    <span className="text-xs text-muted-foreground ml-2">
                      ({campo.tipo})
                    </span>
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default TemplateDetails;
