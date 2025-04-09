
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, BookOpen, Calendar, Clock, ExternalLink, Eye, Filter, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface Norma {
  id: string;
  tipo: string;
  numero: string;
  orgao: string;
  data: string;
  assunto: string;
  resumo: string;
  impacto: 'alto' | 'medio' | 'baixo';
  url: string;
  lido: boolean;
}

interface NotificacaoConfig {
  email: boolean;
  conama: boolean;
  ibama: boolean;
  mma: boolean;
  alto: boolean;
  medio: boolean;
  baixo: boolean;
  frequencia: 'diaria' | 'semanal' | 'mensal';
}

const mockNormas: Norma[] = [
  {
    id: '1',
    tipo: 'Resolução',
    numero: '530/2024',
    orgao: 'CONAMA',
    data: '2024-04-01',
    assunto: 'Critérios para licenciamento ambiental de empreendimentos em áreas urbanas consolidadas',
    resumo: 'Estabelece novos critérios simplificados para o licenciamento ambiental de empreendimentos em áreas urbanas consolidadas, com foco na redução de prazos e simplificação documental para projetos de baixo impacto.',
    impacto: 'alto',
    url: '#',
    lido: false
  },
  {
    id: '2',
    tipo: 'Instrução Normativa',
    numero: '15/2024',
    orgao: 'IBAMA',
    data: '2024-03-25',
    assunto: 'Procedimentos para compensação de Reserva Legal em Unidades de Conservação',
    resumo: 'Disciplina os procedimentos administrativos para a utilização da compensação de Reserva Legal em Unidades de Conservação de domínio público, conforme previsto no art. 66 da Lei nº 12.651/2012.',
    impacto: 'medio',
    url: '#',
    lido: false
  },
  {
    id: '3',
    tipo: 'Portaria',
    numero: '78/2024',
    orgao: 'MMA',
    data: '2024-03-20',
    assunto: 'Lista de espécies ameaçadas de extinção',
    resumo: 'Atualiza a lista oficial de espécies da fauna brasileira ameaçadas de extinção, incluindo 120 novas espécies e alterando o status de conservação de outras 85.',
    impacto: 'alto',
    url: '#',
    lido: false
  },
  {
    id: '4',
    tipo: 'Resolução',
    numero: '529/2024',
    orgao: 'CONAMA',
    data: '2024-03-15',
    assunto: 'Padrões de qualidade do ar',
    resumo: 'Revisa os padrões de qualidade do ar estabelecidos pela Resolução CONAMA nº 491/2018, definindo metas progressivas mais rigorosas para a redução da emissão de poluentes atmosféricos.',
    impacto: 'alto',
    url: '#',
    lido: true
  },
  {
    id: '5',
    tipo: 'Instrução Normativa',
    numero: '14/2024',
    orgao: 'IBAMA',
    data: '2024-03-10',
    assunto: 'Procedimentos para Autorização de Supressão de Vegetação',
    resumo: 'Estabelece novos procedimentos para a concessão de Autorização de Supressão de Vegetação (ASV) para obras de infraestrutura de utilidade pública, incluindo requisitos mais detalhados para o inventário florestal.',
    impacto: 'medio',
    url: '#',
    lido: true
  },
  {
    id: '6',
    tipo: 'Decreto',
    numero: '11.924/2024',
    orgao: 'Federal',
    data: '2024-03-05',
    assunto: 'Regulamentação do mercado de créditos de carbono',
    resumo: 'Regulamenta o mercado brasileiro de redução de emissões de gases de efeito estufa, estabelecendo diretrizes para a validação, registro, monitoramento e comercialização de créditos de carbono.',
    impacto: 'alto',
    url: '#',
    lido: true
  },
  {
    id: '7',
    tipo: 'Resolução',
    numero: '528/2024',
    orgao: 'CONAMA',
    data: '2024-02-28',
    assunto: 'Gestão de áreas contaminadas',
    resumo: 'Define diretrizes e procedimentos para a gestão de áreas contaminadas, incluindo critérios para investigação, avaliação de risco, remediação e monitoramento.',
    impacto: 'medio',
    url: '#',
    lido: true
  }
];

const NormasAlertas = () => {
  const [normas, setNormas] = useState<Norma[]>(mockNormas);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtros, setFiltros] = useState({
    orgao: 'todos',
    impacto: 'todos',
    lido: 'todos'
  });
  const [selectedNorma, setSelectedNorma] = useState<Norma | null>(null);
  const [notificacoes, setNotificacoes] = useState<NotificacaoConfig>({
    email: true,
    conama: true,
    ibama: true,
    mma: true,
    alto: true,
    medio: true,
    baixo: false,
    frequencia: 'semanal'
  });
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is handled real-time in the filtered normas below
  };
  
  const marcarComoLido = (id: string) => {
    setNormas(prev => prev.map(norma => 
      norma.id === id ? { ...norma, lido: true } : norma
    ));
  };
  
  const filteredNormas = normas.filter(norma => {
    // Search filter
    const matchesSearch = searchTerm === '' || 
      norma.assunto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      norma.resumo.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Dropdown filters
    const matchesOrgao = filtros.orgao === 'todos' || norma.orgao === filtros.orgao;
    const matchesImpacto = filtros.impacto === 'todos' || norma.impacto === filtros.impacto;
    const matchesLido = filtros.lido === 'todos' || 
      (filtros.lido === 'lido' && norma.lido) || 
      (filtros.lido === 'nao-lido' && !norma.lido);
    
    return matchesSearch && matchesOrgao && matchesImpacto && matchesLido;
  });

  return (
    <div className="flex flex-col h-full space-y-6">
      <Tabs defaultValue="alertas" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="alertas">Alertas de Normas</TabsTrigger>
          <TabsTrigger value="config">Configurar Notificações</TabsTrigger>
        </TabsList>
        
        <TabsContent value="alertas" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Últimas Atualizações Normativas</CardTitle>
              <CardDescription>
                Acompanhe as recentes alterações na legislação e regulamentação ambiental
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <form onSubmit={handleSearch} className="flex gap-2">
                  <div className="relative flex-grow">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por assunto ou conteúdo..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                  <Button type="submit" variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                </form>
                
                <div className="flex flex-wrap gap-2">
                  <div className="flex items-center space-x-1">
                    <span className="text-sm">Órgão:</span>
                    <Select 
                      value={filtros.orgao} 
                      onValueChange={(v) => setFiltros({...filtros, orgao: v})}
                    >
                      <SelectTrigger className="h-8 w-36">
                        <SelectValue placeholder="Todos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos</SelectItem>
                        <SelectItem value="CONAMA">CONAMA</SelectItem>
                        <SelectItem value="IBAMA">IBAMA</SelectItem>
                        <SelectItem value="MMA">MMA</SelectItem>
                        <SelectItem value="Federal">Federal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <span className="text-sm">Impacto:</span>
                    <Select 
                      value={filtros.impacto} 
                      onValueChange={(v) => setFiltros({...filtros, impacto: v})}
                    >
                      <SelectTrigger className="h-8 w-36">
                        <SelectValue placeholder="Todos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos</SelectItem>
                        <SelectItem value="alto">Alto</SelectItem>
                        <SelectItem value="medio">Médio</SelectItem>
                        <SelectItem value="baixo">Baixo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <span className="text-sm">Status:</span>
                    <Select 
                      value={filtros.lido} 
                      onValueChange={(v) => setFiltros({...filtros, lido: v})}
                    >
                      <SelectTrigger className="h-8 w-36">
                        <SelectValue placeholder="Todos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos</SelectItem>
                        <SelectItem value="lido">Lidos</SelectItem>
                        <SelectItem value="nao-lido">Não lidos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="flex h-[calc(100vh-28rem)]">
            <div className="w-1/2 pr-2">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium">
                  Normas e Resoluções
                  <span className="text-xs text-muted-foreground ml-2">
                    ({filteredNormas.length} resultados)
                  </span>
                </h3>
                <span className="text-xs text-muted-foreground">
                  {normas.filter(n => !n.lido).length} não lidos
                </span>
              </div>
              
              <ScrollArea className="h-[calc(100vh-30rem)]">
                <div className="space-y-2 pr-2">
                  {filteredNormas.length > 0 ? (
                    filteredNormas.map(norma => (
                      <div
                        key={norma.id}
                        onClick={() => setSelectedNorma(norma)}
                        className={cn(
                          "p-3 border rounded-lg cursor-pointer transition-all",
                          selectedNorma?.id === norma.id
                            ? "border-eco-primary bg-eco-muted/30"
                            : "hover:bg-muted/50",
                          !norma.lido && "border-l-4 border-l-eco-primary"
                        )}
                      >
                        <div className="flex justify-between">
                          <div>
                            <div className="flex space-x-2">
                              <Badge 
                                className={cn(
                                  "text-xs",
                                  norma.orgao === 'CONAMA' 
                                    ? "bg-blue-100 text-blue-800" 
                                    : norma.orgao === 'IBAMA'
                                      ? "bg-green-100 text-green-800"
                                      : norma.orgao === 'MMA'
                                        ? "bg-teal-100 text-teal-800"
                                        : "bg-purple-100 text-purple-800"
                                )}
                              >
                                {norma.orgao}
                              </Badge>
                              <Badge 
                                variant="outline" 
                                className={cn(
                                  "text-xs",
                                  norma.impacto === 'alto' 
                                    ? "bg-red-50 text-red-800 border-red-200" 
                                    : norma.impacto === 'medio'
                                      ? "bg-amber-50 text-amber-800 border-amber-200"
                                      : "bg-green-50 text-green-800 border-green-200"
                                )}
                              >
                                {norma.impacto === 'alto' 
                                  ? 'Impacto Alto' 
                                  : norma.impacto === 'medio' 
                                    ? 'Impacto Médio'
                                    : 'Impacto Baixo'
                                }
                              </Badge>
                              {!norma.lido && (
                                <Badge className="bg-eco-primary text-white text-xs">Novo</Badge>
                              )}
                            </div>
                            <p className="font-medium text-sm mt-1">
                              {norma.tipo} {norma.numero}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm line-clamp-2 mt-1">{norma.assunto}</p>
                        <div className="flex text-xs text-muted-foreground mt-2 items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(norma.data).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <p className="text-muted-foreground">Nenhuma norma encontrada.</p>
                      <p className="text-sm">Tente alterar os filtros aplicados.</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
            
            <div className="w-1/2 pl-2">
              {selectedNorma ? (
                <div className="border rounded-lg p-4 h-full flex flex-col">
                  <div className="mb-4 pb-3 border-b">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-serif text-lg font-medium">{selectedNorma.tipo} {selectedNorma.numero}</h3>
                        <p className="text-sm text-muted-foreground">
                          <span className="font-medium">{selectedNorma.orgao}</span> • {new Date(selectedNorma.data).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      
                      {!selectedNorma.lido && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => marcarComoLido(selectedNorma.id)}
                          className="flex items-center h-8"
                        >
                          <Eye className="h-3.5 w-3.5 mr-1" />
                          Marcar como lido
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-4 flex-grow overflow-auto">
                    <div>
                      <h4 className="text-sm font-medium mb-1">Assunto</h4>
                      <p className="text-sm">{selectedNorma.assunto}</p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-1">Resumo</h4>
                      <p className="text-sm whitespace-pre-wrap">{selectedNorma.resumo}</p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-1">Impacto</h4>
                      <Badge 
                        className={cn(
                          selectedNorma.impacto === 'alto' 
                            ? "bg-red-100 text-red-800" 
                            : selectedNorma.impacto === 'medio'
                              ? "bg-amber-100 text-amber-800"
                              : "bg-green-100 text-green-800"
                        )}
                      >
                        {selectedNorma.impacto === 'alto' 
                          ? 'Alto Impacto' 
                          : selectedNorma.impacto === 'medio' 
                            ? 'Impacto Médio'
                            : 'Impacto Baixo'
                        }
                      </Badge>
                      <p className="text-sm mt-1">
                        {selectedNorma.impacto === 'alto' 
                          ? 'Esta norma pode ter impacto significativo em processos de licenciamento e compliance ambiental.' 
                          : selectedNorma.impacto === 'medio' 
                            ? 'Esta norma pode exigir adaptações moderadas em procedimentos e documentações.'
                            : 'Esta norma tem impacto limitado e exige apenas ajustes menores.'
                        }
                      </p>
                    </div>
                  </div>
                  
                  <div className="pt-3 border-t mt-4">
                    <Button 
                      variant="outline" 
                      className="w-full flex items-center justify-center"
                      onClick={() => window.open(selectedNorma.url, '_blank')}
                    >
                      <BookOpen className="h-4 w-4 mr-2" />
                      Acessar publicação oficial
                      <ExternalLink className="h-3 w-3 ml-2" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center border rounded-lg p-4 bg-muted/30">
                  <Bell className="h-12 w-12 text-muted-foreground opacity-30 mb-3" />
                  <h3 className="text-lg font-medium mb-1">Nenhuma norma selecionada</h3>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    Selecione uma norma da lista para visualizar seus detalhes.
                  </p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="config">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Notificação</CardTitle>
              <CardDescription>
                Personalize como deseja ser notificado sobre novas normas e resoluções
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-sm font-medium mb-3">Método de Notificação</h3>
                <div className="flex items-center space-x-2 mb-2">
                  <Checkbox 
                    id="email" 
                    checked={notificacoes.email}
                    onCheckedChange={(checked) => 
                      setNotificacoes({...notificacoes, email: checked === true})
                    }
                  />
                  <label htmlFor="email" className="text-sm cursor-pointer">
                    Receber alertas por e-mail
                  </label>
                </div>
                <Input 
                  type="email" 
                  placeholder="seu@email.com" 
                  className="max-w-sm" 
                  disabled={!notificacoes.email}
                />
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-3">Órgãos Monitorados</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="conama" 
                      checked={notificacoes.conama}
                      onCheckedChange={(checked) => 
                        setNotificacoes({...notificacoes, conama: checked === true})
                      }
                    />
                    <label htmlFor="conama" className="text-sm cursor-pointer">CONAMA</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="ibama" 
                      checked={notificacoes.ibama}
                      onCheckedChange={(checked) => 
                        setNotificacoes({...notificacoes, ibama: checked === true})
                      }
                    />
                    <label htmlFor="ibama" className="text-sm cursor-pointer">IBAMA</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="mma" 
                      checked={notificacoes.mma}
                      onCheckedChange={(checked) => 
                        setNotificacoes({...notificacoes, mma: checked === true})
                      }
                    />
                    <label htmlFor="mma" className="text-sm cursor-pointer">Ministério do Meio Ambiente</label>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-3">Nível de Impacto</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="alto" 
                      checked={notificacoes.alto}
                      onCheckedChange={(checked) => 
                        setNotificacoes({...notificacoes, alto: checked === true})
                      }
                    />
                    <label htmlFor="alto" className="text-sm cursor-pointer">Alto Impacto</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="medio" 
                      checked={notificacoes.medio}
                      onCheckedChange={(checked) => 
                        setNotificacoes({...notificacoes, medio: checked === true})
                      }
                    />
                    <label htmlFor="medio" className="text-sm cursor-pointer">Impacto Médio</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="baixo" 
                      checked={notificacoes.baixo}
                      onCheckedChange={(checked) => 
                        setNotificacoes({...notificacoes, baixo: checked === true})
                      }
                    />
                    <label htmlFor="baixo" className="text-sm cursor-pointer">Baixo Impacto</label>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-3">Frequência de Alertas</h3>
                <div className="max-w-xs">
                  <Select 
                    value={notificacoes.frequencia} 
                    onValueChange={(v: 'diaria' | 'semanal' | 'mensal') => 
                      setNotificacoes({...notificacoes, frequencia: v})
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione a frequência" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="diaria">Diária</SelectItem>
                      <SelectItem value="semanal">Semanal</SelectItem>
                      <SelectItem value="mensal">Mensal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Restaurar Padrões</Button>
              <Button className="bg-eco-primary hover:bg-eco-dark">
                <Bell className="h-4 w-4 mr-2" />
                Salvar Configurações
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NormasAlertas;
