
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  FilePlus, 
  Save, 
  Download, 
  Edit, 
  Copy, 
  Trash2, 
  CheckCircle, 
  ArrowRight, 
  Calendar, 
  Clock, 
  AlertTriangle,
  Loader2 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface Template {
  id: string;
  nome: string;
  categoria: string;
  descricao: string;
  campos: { nome: string; tipo: 'texto' | 'data' | 'numero' | 'opcao'; obrigatorio: boolean; opcoes?: string[] }[];
}

interface Peca {
  id: string;
  nome: string;
  template: string;
  dataCriacao: Date;
  status: 'rascunho' | 'concluida';
  conteudo?: string;
}

const mockTemplates: Template[] = [
  {
    id: '1',
    nome: 'Impugnação de Auto de Infração Ambiental',
    categoria: 'Defesa Administrativa',
    descricao: 'Modelo para impugnar autos de infração emitidos por órgãos ambientais como IBAMA e ICMBio.',
    campos: [
      { nome: 'Número do Auto de Infração', tipo: 'texto', obrigatorio: true },
      { nome: 'Data do Auto de Infração', tipo: 'data', obrigatorio: true },
      { nome: 'Órgão Emissor', tipo: 'opcao', obrigatorio: true, opcoes: ['IBAMA', 'ICMBio', 'Secretaria Estadual', 'Secretaria Municipal'] },
      { nome: 'Valor da Multa', tipo: 'numero', obrigatorio: true },
      { nome: 'Nome do Autuado', tipo: 'texto', obrigatorio: true },
      { nome: 'Descrição da Infração', tipo: 'texto', obrigatorio: true }
    ]
  },
  {
    id: '2',
    nome: 'Petição Inicial de Ação Civil Pública Ambiental',
    categoria: 'Ação Judicial',
    descricao: 'Modelo para propositura de Ação Civil Pública por danos ambientais.',
    campos: [
      { nome: 'Vara/Comarca', tipo: 'texto', obrigatorio: true },
      { nome: 'Nome do Réu', tipo: 'texto', obrigatorio: true },
      { nome: 'Descrição do Dano Ambiental', tipo: 'texto', obrigatorio: true },
      { nome: 'Local do Dano', tipo: 'texto', obrigatorio: true },
      { nome: 'Data do Dano', tipo: 'data', obrigatorio: true },
      { nome: 'Valor da Causa', tipo: 'numero', obrigatorio: true }
    ]
  },
  {
    id: '3',
    nome: 'Recurso de Multa Ambiental',
    categoria: 'Defesa Administrativa',
    descricao: 'Modelo para recorrer de decisões administrativas em primeira instância sobre multas ambientais.',
    campos: [
      { nome: 'Número do Processo', tipo: 'texto', obrigatorio: true },
      { nome: 'Órgão Julgador', tipo: 'texto', obrigatorio: true },
      { nome: 'Data da Decisão', tipo: 'data', obrigatorio: true },
      { nome: 'Nome do Recorrente', tipo: 'texto', obrigatorio: true },
      { nome: 'Resumo da Decisão Recorrida', tipo: 'texto', obrigatorio: true }
    ]
  },
  {
    id: '4',
    nome: 'Contestação em Ação Ambiental',
    categoria: 'Ação Judicial',
    descricao: 'Modelo para apresentar defesa em ações judiciais ambientais.',
    campos: [
      { nome: 'Número do Processo', tipo: 'texto', obrigatorio: true },
      { nome: 'Nome do Autor', tipo: 'texto', obrigatorio: true },
      { nome: 'Nome do Réu', tipo: 'texto', obrigatorio: true },
      { nome: 'Vara/Tribunal', tipo: 'texto', obrigatorio: true },
      { nome: 'Resumo da Acusação', tipo: 'texto', obrigatorio: true }
    ]
  },
  {
    id: '5',
    nome: 'Termo de Compromisso de Ajustamento de Conduta (TAC)',
    categoria: 'Acordos',
    descricao: 'Modelo de TAC para regularização de condutas lesivas ao meio ambiente.',
    campos: [
      { nome: 'Compromitente (Órgão Ambiental)', tipo: 'texto', obrigatorio: true },
      { nome: 'Compromissário', tipo: 'texto', obrigatorio: true },
      { nome: 'Descrição do Dano/Irregularidade', tipo: 'texto', obrigatorio: true },
      { nome: 'Localização da Área', tipo: 'texto', obrigatorio: true },
      { nome: 'Prazo para Regularização', tipo: 'numero', obrigatorio: true },
      { nome: 'Valor da Multa por Descumprimento', tipo: 'numero', obrigatorio: true }
    ]
  }
];

const PecasJuridicas = () => {
  const [templates] = useState<Template[]>(mockTemplates);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [pecas, setPecas] = useState<Peca[]>([
    {
      id: '1',
      nome: 'Impugnação Auto IBAMA 123456',
      template: '1',
      dataCriacao: new Date(2024, 2, 15),
      status: 'concluida'
    },
    {
      id: '2',
      nome: 'ACP contra Mineradora XYZ',
      template: '2',
      dataCriacao: new Date(2024, 3, 5),
      status: 'rascunho'
    }
  ]);
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
  
  // Mock content for demonstration
  const mockContent = `
EXCELENTÍSSIMO(A) SENHOR(A) PRESIDENTE DO INSTITUTO BRASILEIRO DO MEIO AMBIENTE E DOS RECURSOS NATURAIS RENOVÁVEIS – IBAMA

AUTO DE INFRAÇÃO Nº 123456-A
PROCESSO ADMINISTRATIVO Nº 02008.000123/2024-01

EMPRESA XYZ LTDA., pessoa jurídica de direito privado, inscrita no CNPJ sob o nº XX.XXX.XXX/0001-XX, com sede na [endereço completo], por seus advogados que esta subscrevem (procuração anexa), vem, respeitosamente, à presença de Vossa Excelência, apresentar

IMPUGNAÇÃO AO AUTO DE INFRAÇÃO

lavrado em 05/03/2024, pelos fatos e fundamentos jurídicos a seguir expostos.

I – DOS FATOS

Em 05/03/2024, a Impugnante foi autuada pelo IBAMA por suposta infração ambiental, consubstanciada na "supressão de vegetação nativa em Área de Preservação Permanente sem autorização do órgão ambiental competente", sendo aplicada multa no valor de R$ 50.000,00 (cinquenta mil reais).

Contudo, como será demonstrado, a autuação padece de vícios formais e materiais que comprometem sua validade, impondo-se o seu cancelamento.

II – DAS PRELIMINARES

II.1 – DA NULIDADE DO AUTO DE INFRAÇÃO POR VÍCIO FORMAL

O auto de infração não atende aos requisitos mínimos previstos no art. 96 do Decreto nº 6.514/2008, notadamente quanto à descrição precisa da infração supostamente cometida e à indicação dos dispositivos legais e regulamentares infringidos.

A descrição genérica impede o pleno exercício do direito de defesa, assegurado pela Constituição Federal e pela Lei nº 9.784/1999, que regula o processo administrativo federal.

II.2 – DA AUSÊNCIA DE NEXO CAUSAL

Não há nos autos elementos probatórios que demonstrem o nexo de causalidade entre a conduta da Impugnante e o dano ambiental apontado no auto de infração.

III – DO MÉRITO

III.1 – DA INEXISTÊNCIA DE INFRAÇÃO AMBIENTAL

A área objeto da autuação não constitui Área de Preservação Permanente, conforme se comprova pelos estudos técnicos em anexo, elaborados por profissionais habilitados, com Anotação de Responsabilidade Técnica registrada junto ao CREA.

III.2 – DA LICENÇA AMBIENTAL VÁLIDA

A Impugnante possui licença ambiental válida para suas atividades, emitida pela Secretaria Estadual de Meio Ambiente (documento anexo), com base em estudos técnicos aprovados pelo órgão ambiental competente.

III.3 – DA DESPROPORCIONALIDADE DA MULTA

Ainda que se admitisse a ocorrência de infração, o que se cogita apenas por amor ao debate, o valor da multa aplicada mostra-se manifestamente desproporcional, não observando os critérios estabelecidos nos arts. 4º e 6º da Lei nº 9.605/98.

IV – DOS PEDIDOS

Ante o exposto, requer-se:

a) O recebimento e processamento da presente impugnação;
b) A anulação do Auto de Infração nº 123456-A, pelos vícios formais apontados;
c) Subsidiariamente, o cancelamento da penalidade imposta, ante a inexistência de infração ambiental;
d) Ainda subsidiariamente, a redução do valor da multa aplicada, observando-se os princípios da razoabilidade e proporcionalidade.

Nestes termos,
Pede deferimento.

[Local], [Data]

[Advogado]
OAB/XX nº XXXXX
  `;

  const handleSelectTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(template);
      setNovaPeca(prev => ({ 
        ...prev, 
        templateId: templateId,
        campos: {} // Reset campos when changing template
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

  const handleCreatePeca = () => {
    setIsGenerating(true);
    
    // Simulate API delay for generating document
    setTimeout(() => {
      const newPeca: Peca = {
        id: Date.now().toString(),
        nome: novaPeca.nome,
        template: novaPeca.templateId,
        dataCriacao: new Date(),
        status: 'concluida',
        conteudo: mockContent
      };
      
      setPecas(prev => [...prev, newPeca]);
      setSelectedPeca(newPeca);
      setGeneratedContent(mockContent);
      setIsGenerating(false);
      
      // Reset form
      setNovaPeca({
        nome: '',
        templateId: '',
        campos: {}
      });
      setSelectedTemplate(null);
    }, 3000);
  };

  const handleEditPeca = (pecaId: string) => {
    const peca = pecas.find(p => p.id === pecaId);
    if (peca) {
      setSelectedPeca(peca);
      setGeneratedContent(mockContent); // In real app, load actual content
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
              <Card>
                <CardHeader>
                  <CardTitle>Modelos Disponíveis</CardTitle>
                  <CardDescription>
                    Selecione um modelo para sua peça jurídica
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
                          onClick={() => handleSelectTemplate(template.id)}
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

              {selectedTemplate && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle>Detalhes do Modelo</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <h3 className="font-medium mb-2">{selectedTemplate.nome}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{selectedTemplate.descricao}</p>
                    
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="campos">
                        <AccordionTrigger className="text-sm">
                          Campos Necessários ({selectedTemplate.campos.length})
                        </AccordionTrigger>
                        <AccordionContent>
                          <ul className="space-y-1 text-sm">
                            {selectedTemplate.campos.map((campo, index) => (
                              <li key={index} className="flex items-center">
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
              )}
            </div>
            
            <div className="md:col-span-2">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Preencher Informações</CardTitle>
                  <CardDescription>
                    {selectedTemplate 
                      ? `Forneça os dados para gerar sua peça "${selectedTemplate.nome}"`
                      : "Selecione um modelo à esquerda para começar"
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
                        placeholder="Ex: Impugnação Auto de Infração IBAMA 123/2024"
                        value={novaPeca.nome}
                        onChange={e => setNovaPeca({...novaPeca, nome: e.target.value})}
                      />
                    </div>
                    
                    <div className="space-y-4">
                      {selectedTemplate.campos.map((campo, index) => (
                        <div key={index}>
                          <label className="text-sm font-medium mb-1 block">
                            {campo.nome} {campo.obrigatorio && <span className="text-red-500">*</span>}
                          </label>
                          
                          {campo.tipo === 'texto' && (
                            campo.nome.toLowerCase().includes('descrição') ? (
                              <Textarea
                                placeholder={`Digite ${campo.nome.toLowerCase()}`}
                                value={novaPeca.campos[campo.nome] || ''}
                                onChange={e => handleCampoChange(campo.nome, e.target.value)}
                                rows={4}
                              />
                            ) : (
                              <Input
                                placeholder={`Digite ${campo.nome.toLowerCase()}`}
                                value={novaPeca.campos[campo.nome] || ''}
                                onChange={e => handleCampoChange(campo.nome, e.target.value)}
                              />
                            )
                          )}
                          
                          {campo.tipo === 'data' && (
                            <Input
                              type="date"
                              value={novaPeca.campos[campo.nome] || ''}
                              onChange={e => handleCampoChange(campo.nome, e.target.value)}
                            />
                          )}
                          
                          {campo.tipo === 'numero' && (
                            <Input
                              type="number"
                              placeholder={`Digite ${campo.nome.toLowerCase()}`}
                              value={novaPeca.campos[campo.nome] || ''}
                              onChange={e => handleCampoChange(campo.nome, e.target.value)}
                            />
                          )}
                          
                          {campo.tipo === 'opcao' && campo.opcoes && (
                            <Select
                              value={novaPeca.campos[campo.nome] || ''}
                              onValueChange={value => handleCampoChange(campo.nome, value)}
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
                            Você está prestes a gerar uma peça jurídica com base nas informações fornecidas.
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
                                <p className="text-xs text-muted-foreground mt-1">
                                  Aguarde enquanto a IA elabora sua peça jurídica
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div>
                              <p className="text-sm">
                                A IA irá analisar as informações fornecidas para criar uma peça jurídica personalizada.
                                Este processo leva alguns segundos.
                              </p>
                              <ul className="text-sm mt-2 space-y-1">
                                <li className="flex items-center">
                                  <CheckCircle className="h-3 w-3 text-green-500 mr-2" />
                                  Aplicação de legislação ambiental atualizada
                                </li>
                                <li className="flex items-center">
                                  <CheckCircle className="h-3 w-3 text-green-500 mr-2" />
                                  Estruturação conforme práticas jurídicas correntes
                                </li>
                                <li className="flex items-center">
                                  <CheckCircle className="h-3 w-3 text-green-500 mr-2" />
                                  Incorporação de jurisprudência relevante
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
                                onClick={handleCreatePeca}
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
                      Escolha um dos modelos disponíveis à esquerda para começar a criar sua peça jurídica.
                    </p>
                    <AlertTriangle className="h-4 w-4 text-amber-500 mt-4" />
                    <p className="text-xs text-muted-foreground mt-1">
                      Campos marcados com <span className="text-red-500">*</span> são obrigatórios
                    </p>
                  </CardContent>
                )}
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="minhas" className="mt-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100vh-16rem)]">
            <div className="md:col-span-1">
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
                            onClick={() => handleEditPeca(peca.id)}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium text-sm">{peca.nome}</h4>
                                <p className="text-xs text-muted-foreground">
                                  {template?.nome || 'Modelo personalizado'}
                                </p>
                              </div>
                              <Badge variant={peca.status === 'concluida' ? 'default' : 'outline'}>
                                {peca.status === 'concluida' ? 'Concluída' : 'Rascunho'}
                              </Badge>
                            </div>
                            <div className="flex text-xs text-muted-foreground mt-2 items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {peca.dataCriacao.toLocaleDateString('pt-BR')}
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
            </div>
            
            <div className="md:col-span-2">
              {selectedPeca ? (
                <Card className="h-full flex flex-col">
                  <CardHeader className="pb-3 flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>{selectedPeca.nome}</CardTitle>
                      <CardDescription>
                        Criada em {selectedPeca.dataCriacao.toLocaleDateString('pt-BR')}
                      </CardDescription>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-1" />
                        <span className="hidden sm:inline">Editar</span>
                      </Button>
                      <Button variant="outline" size="sm">
                        <Copy className="h-4 w-4 mr-1" />
                        <span className="hidden sm:inline">Duplicar</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-red-500 hover:text-red-700" 
                        onClick={() => handleDeletePeca(selectedPeca.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="flex-grow p-0 relative">
                    <div className="absolute inset-0 flex flex-col">
                      <div className="bg-muted/30 p-2 border-t border-b flex items-center justify-between">
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm" className="h-7 px-2">
                            <Download className="h-4 w-4 mr-1" />
                            <span className="text-xs">Baixar</span>
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 px-2">
                            <Copy className="h-4 w-4 mr-1" />
                            <span className="text-xs">Copiar</span>
                          </Button>
                        </div>
                        <div>
                          <Button variant="ghost" size="sm" className="h-7 px-2">
                            <Save className="h-4 w-4 mr-1" />
                            <span className="text-xs">Salvar</span>
                          </Button>
                        </div>
                      </div>
                      
                      <ScrollArea className="flex-grow p-4">
                        <div className="bg-white rounded-md p-6 font-serif text-sm leading-relaxed whitespace-pre-line">
                          {generatedContent || 'Carregando conteúdo...'}
                        </div>
                      </ScrollArea>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="h-full flex flex-col items-center justify-center text-center p-8">
                  <FileText className="h-16 w-16 text-muted-foreground opacity-30 mb-4" />
                  <h3 className="text-lg font-medium">Selecione uma Peça</h3>
                  <p className="text-sm text-muted-foreground max-w-sm mt-2">
                    Escolha uma peça jurídica à esquerda para visualizar seu conteúdo.
                  </p>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PecasJuridicas;
