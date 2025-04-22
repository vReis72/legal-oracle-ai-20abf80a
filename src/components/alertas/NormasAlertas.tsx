
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, BookOpen, ExternalLink, Filter, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface NotificacaoConfig {
  email: boolean;
  conama: boolean;
  ibama: boolean;
  mma: boolean;
  stf: boolean;
  stj: boolean;
  congresso: boolean;
  outros: boolean;
  alto: boolean;
  medio: boolean;
  baixo: boolean;
  frequencia: 'diaria' | 'semanal' | 'mensal';
}

// Array de órgãos ampliado para múltiplas áreas
const ORGAOS = [
  { value: "todos", label: "Todos" },
  { value: "CONAMA", label: "CONAMA" },
  { value: "IBAMA", label: "IBAMA" },
  { value: "MMA", label: "MMA" },
  { value: "STF", label: "Supremo Tribunal Federal" },
  { value: "STJ", label: "Superior Tribunal de Justiça" },
  { value: "Congresso", label: "Congresso Nacional" },
  { value: "Senado", label: "Senado Federal" },
  { value: "Camara", label: "Câmara dos Deputados" },
  { value: "Presidencia", label: "Presidência da República" },
  { value: "TSE", label: "Tribunal Superior Eleitoral" },
  { value: "CNJ", label: "Conselho Nacional de Justiça" },
  { value: "CNSP", label: "Conselho Nacional de Seguros Privados" },
  { value: "CVM", label: "Comissão de Valores Mobiliários" },
  { value: "BACEN", label: "Banco Central" },
  { value: "ANVISA", label: "ANVISA" },
  { value: "ANATEL", label: "ANATEL" },
  { value: "Outros", label: "Outros" }
];

const NormasAlertas = () => {
  // Removemos completamente o mockNormas e todo gerenciamento local de normas
  const [filtros, setFiltros] = useState({
    orgao: 'todos',
    impacto: 'todos',
    lido: 'todos'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [notificacoes, setNotificacoes] = useState<NotificacaoConfig>({
    email: true,
    conama: true,
    ibama: true,
    mma: true,
    stf: true,
    stj: true,
    congresso: true,
    outros: true,
    alto: true,
    medio: true,
    baixo: false,
    frequencia: 'semanal'
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Busca será implementada quando integração aos dados reais for feita
  };

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
                Acompanhe as recentes alterações na legislação, regulamentação e decisões em múltiplas áreas do Direito brasileiro.
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
                      disabled
                    />
                  </div>
                  <Button type="submit" variant="outline" size="icon" disabled>
                    <Filter className="h-4 w-4" />
                  </Button>
                </form>
                
                <div className="flex flex-wrap gap-2">
                  <div className="flex items-center space-x-1">
                    <span className="text-sm">Órgão:</span>
                    <Select 
                      value={filtros.orgao} 
                      onValueChange={v => setFiltros({...filtros, orgao: v})}
                      disabled
                    >
                      <SelectTrigger className="h-8 w-48">
                        <SelectValue placeholder="Todos" />
                      </SelectTrigger>
                      <SelectContent>
                        {ORGAOS.map((o) => (
                          <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="text-sm">Impacto:</span>
                    <Select 
                      value={filtros.impacto} 
                      onValueChange={v => setFiltros({...filtros, impacto: v})}
                      disabled
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
                      disabled
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
            <div className="w-full flex justify-center items-center">
              <div className="flex flex-col items-center justify-center border rounded-lg p-8 text-center bg-muted/30 max-w-lg mx-auto">
                <BookOpen className="h-12 w-12 text-muted-foreground opacity-30 mb-3" />
                <h3 className="text-lg font-medium mb-1">Nenhuma norma disponível</h3>
                <p className="text-sm text-muted-foreground mb-2 max-w-md">
                  As normas, resoluções e decisões emitidas por órgãos oficiais serão exibidas aqui assim que sua integração for concluída.<br />
                  Ative a integração com suas fontes de dados reais para começar a acompanhar atualizações legislativas e normativas de diversas áreas!
                </p>
                <div className="text-xs text-muted-foreground mt-2">
                  <ExternalLink className="inline h-3 w-3 mr-1" />
                  Nenhum dado fictício utilizado.
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="config">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Notificação</CardTitle>
              <CardDescription>
                Personalize como deseja ser notificado sobre novas normas, resoluções e decisões oficiais
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-sm font-medium mb-3">Método de Notificação</h3>
                <div className="flex items-center space-x-2 mb-2">
                  <Checkbox 
                    id="email" 
                    checked={notificacoes.email}
                    onCheckedChange={checked => 
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
                      onCheckedChange={checked => setNotificacoes({...notificacoes, conama: checked === true})}
                    />
                    <label htmlFor="conama" className="text-sm cursor-pointer">CONAMA</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="ibama" 
                      checked={notificacoes.ibama}
                      onCheckedChange={checked => setNotificacoes({...notificacoes, ibama: checked === true})}
                    />
                    <label htmlFor="ibama" className="text-sm cursor-pointer">IBAMA</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="mma" 
                      checked={notificacoes.mma}
                      onCheckedChange={checked => setNotificacoes({...notificacoes, mma: checked === true})}
                    />
                    <label htmlFor="mma" className="text-sm cursor-pointer">Ministério do Meio Ambiente</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="stf" 
                      checked={notificacoes.stf}
                      onCheckedChange={checked => setNotificacoes({...notificacoes, stf: checked === true})}
                    />
                    <label htmlFor="stf" className="text-sm cursor-pointer">STF</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="stj" 
                      checked={notificacoes.stj}
                      onCheckedChange={checked => setNotificacoes({...notificacoes, stj: checked === true})}
                    />
                    <label htmlFor="stj" className="text-sm cursor-pointer">STJ</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="congresso" 
                      checked={notificacoes.congresso}
                      onCheckedChange={checked => setNotificacoes({...notificacoes, congresso: checked === true})}
                    />
                    <label htmlFor="congresso" className="text-sm cursor-pointer">Congresso Nacional</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="outros" 
                      checked={notificacoes.outros}
                      onCheckedChange={checked => setNotificacoes({...notificacoes, outros: checked === true})}
                    />
                    <label htmlFor="outros" className="text-sm cursor-pointer">Outros</label>
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
                      onCheckedChange={checked => setNotificacoes({...notificacoes, alto: checked === true})}
                    />
                    <label htmlFor="alto" className="text-sm cursor-pointer">Alto Impacto</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="medio" 
                      checked={notificacoes.medio}
                      onCheckedChange={checked => setNotificacoes({...notificacoes, medio: checked === true})}
                    />
                    <label htmlFor="medio" className="text-sm cursor-pointer">Impacto Médio</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="baixo" 
                      checked={notificacoes.baixo}
                      onCheckedChange={checked => setNotificacoes({...notificacoes, baixo: checked === true})}
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
                    onValueChange={v => setNotificacoes({...notificacoes, frequencia: v as 'diaria' | 'semanal' | 'mensal'})}
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
