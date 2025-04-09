
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  FileUp, 
  FileText, 
  Check, 
  X, 
  AlertTriangle, 
  PencilRuler, 
  Bookmark,
  ChevronDown, 
  ChevronUp,
  Loader2, 
  Search
} from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import { cn } from '@/lib/utils';

interface Document {
  id: string;
  name: string;
  type: 'parecer' | 'auto-de-infracao' | 'licenca';
  uploadDate: Date;
  processed: boolean;
  content?: string;
  summary?: string;
  highlights?: {
    text: string;
    page: number;
    importance: 'high' | 'medium' | 'low';
  }[];
  keyPoints?: {
    title: string;
    description: string;
  }[];
}

const DocumentReader = () => {
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: '1',
      name: 'Parecer Técnico IBAMA 134-2023',
      type: 'parecer',
      uploadDate: new Date(2023, 8, 15),
      processed: true,
      content: 'Este parecer técnico analisa o impacto ambiental das atividades da empresa XYZ na área de preservação permanente do Rio Verde. Após vistoria realizada em 10/08/2023, foram constatadas as seguintes irregularidades: 1) Supressão de vegetação nativa em APP; 2) Construção de estruturas permanentes em área non aedificandi; 3) Descarte irregular de efluentes líquidos.',
      summary: 'Parecer técnico constata irregularidades ambientais da empresa XYZ em área de APP, incluindo supressão de vegetação, construções irregulares e descarte inadequado de efluentes.',
      highlights: [
        { 
          text: 'A supressão total foi estimada em 2,7 hectares de vegetação nativa de Mata Atlântica em estágio médio de regeneração.', 
          page: 3, 
          importance: 'high' 
        },
        { 
          text: 'As análises laboratoriais indicaram concentrações de metais pesados nos efluentes em valores até 300% acima do permitido pela legislação vigente.', 
          page: 5, 
          importance: 'high' 
        },
        { 
          text: 'A empresa apresentou licença estadual, porém a mesma não contempla atividades em APP.', 
          page: 7, 
          importance: 'medium' 
        }
      ],
      keyPoints: [
        {
          title: 'Infrações Identificadas',
          description: 'Desmatamento ilegal em APP, construções irregulares e poluição hídrica.'
        },
        {
          title: 'Base Legal',
          description: 'Violação da Lei 12.651/2012 (Código Florestal), arts. 4º e 7º, e da Resolução CONAMA 430/2011.'
        },
        {
          title: 'Recomendação do Parecer',
          description: 'Aplicação de multa, embargo das atividades e obrigação de recuperação da área degradada.'
        }
      ]
    },
    {
      id: '2',
      name: 'Auto de Infração SPU 76234/2023',
      type: 'auto-de-infracao',
      uploadDate: new Date(2023, 10, 3),
      processed: true,
      content: 'Em fiscalização realizada no dia 30/10/2023, foi constatada a ocupação irregular de terreno de marinha, com construção de residência de veraneio sem autorização da SPU, causando danos à vegetação de restinga. O autuado, Sr. João Carlos Silva, CPF XXX.XXX.XXX-XX, foi multado em R$ 50.000,00 com base no art. 20 do Decreto 6.514/2008.',
      summary: 'Auto de infração por ocupação irregular de terreno de marinha com construção não autorizada e danos à vegetação de restinga. Multa de R$ 50.000,00.',
      highlights: [
        { 
          text: 'A área ocupada irregularmente corresponde a 450m² de terreno de marinha, classificado como bem da União.', 
          page: 1, 
          importance: 'high' 
        },
        { 
          text: 'O autuado apresentou documentação particular de compra e venda, sem registro em cartório e sem autorização da SPU.', 
          page: 2, 
          importance: 'medium' 
        }
      ],
      keyPoints: [
        {
          title: 'Infração',
          description: 'Ocupação irregular de bem da União (terreno de marinha) com dano ambiental.'
        },
        {
          title: 'Sanção Aplicada',
          description: 'Multa de R$ 50.000,00 e demolição da estrutura.'
        },
        {
          title: 'Prazo para Defesa',
          description: '20 dias corridos a partir da ciência do auto.'
        }
      ]
    },
    {
      id: '3',
      name: 'Licença Ambiental Prévia CETESB 45/2023',
      type: 'licenca',
      uploadDate: new Date(2023, 11, 20),
      processed: false
    }
  ]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setUploading(true);
      
      // Simulate file upload with progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += 5;
        setUploadProgress(progress);
        
        if (progress >= 100) {
          clearInterval(interval);
          
          // Simulate processing delay
          setTimeout(() => {
            const newDocument: Document = {
              id: Date.now().toString(),
              name: file.name,
              type: file.name.toLowerCase().includes('parecer') 
                ? 'parecer' 
                : file.name.toLowerCase().includes('infracao') 
                  ? 'auto-de-infracao' 
                  : 'licenca',
              uploadDate: new Date(),
              processed: false
            };
            
            setDocuments(prev => [newDocument, ...prev]);
            setUploading(false);
            setUploadProgress(0);
            
            // Simulate document processing
            setTimeout(() => {
              setDocuments(prev => prev.map(doc => 
                doc.id === newDocument.id 
                  ? {
                      ...doc,
                      processed: true,
                      content: 'Conteúdo do documento carregado recentemente...',
                      summary: 'Este é um resumo automático do documento carregado.',
                      highlights: [
                        { text: 'Trecho importante do documento.', page: 1, importance: 'medium' }
                      ],
                      keyPoints: [
                        {
                          title: 'Ponto Principal',
                          description: 'Descrição do ponto principal do documento.'
                        }
                      ]
                    } 
                  : doc
              ));
            }, 3000);
          }, 500);
        }
      }, 100);
    }
  };

  const toggleSection = (section: string) => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
    }
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Análise de Documentos Ambientais</CardTitle>
          <CardDescription>
            Faça upload de pareceres, autos de infração e licenças para análise automática
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <label 
              htmlFor="file-upload" 
              className={cn(
                "flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/50 transition-all",
                uploading && "border-eco-primary"
              )}
            >
              {!uploading ? (
                <>
                  <FileUp className="h-10 w-10 mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Arraste documentos ou clique para fazer upload</p>
                  <p className="text-xs text-muted-foreground mt-1">PDF, DOCX, TXT (max. 20MB)</p>
                </>
              ) : (
                <div className="w-full px-6 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Enviando documento...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              )}
              <input 
                id="file-upload" 
                type="file" 
                accept=".pdf,.docx,.txt" 
                className="hidden" 
                onChange={handleFileUpload}
                disabled={uploading}
              />
            </label>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col flex-grow">
        <Tabs defaultValue="todos" className="flex-grow flex flex-col">
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="todos">Todos</TabsTrigger>
              <TabsTrigger value="pareceres">Pareceres</TabsTrigger>
              <TabsTrigger value="autos">Autos de Infração</TabsTrigger>
              <TabsTrigger value="licencas">Licenças</TabsTrigger>
            </TabsList>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{documents.length} documentos</span>
              <span>•</span>
              <span>{documents.filter(d => d.processed).length} analisados</span>
            </div>
          </div>
          
          <div className="mt-4 flex-grow flex">
            <div className="w-1/3 border-r pr-4">
              <h3 className="text-sm font-medium mb-3">Documentos</h3>
              <ScrollArea className="h-[calc(100vh-24rem)]">
                <div className="space-y-2 pr-2">
                  {documents.map(doc => (
                    <div 
                      key={doc.id} 
                      className={cn(
                        "p-3 border rounded-md cursor-pointer hover:bg-muted/50 transition-all",
                        selectedDocument?.id === doc.id && "border-eco-primary bg-eco-muted/30"
                      )}
                      onClick={() => setSelectedDocument(doc)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-start space-x-2">
                          <FileText className={cn(
                            "h-5 w-5 mt-0.5",
                            doc.type === 'parecer' ? "text-blue-500" : 
                            doc.type === 'auto-de-infracao' ? "text-red-500" : 
                            "text-green-500"
                          )} />
                          <div>
                            <p className="text-sm font-medium line-clamp-1">{doc.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {doc.uploadDate.toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>
                        {doc.processed ? (
                          <Badge variant="outline" className="bg-eco-light text-eco-dark text-xs">
                            <Check className="h-3 w-3 mr-1" />
                            Analisado
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-muted text-xs">
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                            Processando
                          </Badge>
                        )}
                      </div>
                      
                      <div className="mt-2">
                        <Badge 
                          variant="secondary" 
                          className={cn(
                            "text-xs",
                            doc.type === 'parecer' ? "bg-blue-100 text-blue-800" : 
                            doc.type === 'auto-de-infracao' ? "bg-red-100 text-red-800" : 
                            "bg-green-100 text-green-800"
                          )}
                        >
                          {doc.type === 'parecer' 
                            ? 'Parecer Técnico' 
                            : doc.type === 'auto-de-infracao' 
                              ? 'Auto de Infração' 
                              : 'Licença Ambiental'
                          }
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
            
            <div className="w-2/3 pl-4">
              {selectedDocument ? (
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="font-serif text-xl">{selectedDocument.name}</h2>
                      <p className="text-sm text-muted-foreground">
                        Carregado em {selectedDocument.uploadDate.toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-eco-secondary hover:text-eco-dark hover:bg-eco-muted"
                    >
                      <Search className="h-4 w-4 mr-1" />
                      Ver original
                    </Button>
                  </div>

                  {selectedDocument.processed ? (
                    <ScrollArea className="h-[calc(100vh-24rem)]">
                      <div className="space-y-6">
                        <Card>
                          <CardHeader 
                            className={cn(
                              "pb-2 cursor-pointer",
                              expandedSection === 'resumo' ? "" : "pb-0"
                            )}
                            onClick={() => toggleSection('resumo')}
                          >
                            <div className="flex justify-between items-center">
                              <CardTitle className="text-lg flex items-center">
                                <PencilRuler className="h-5 w-5 mr-2" />
                                Resumo Executivo
                              </CardTitle>
                              {expandedSection === 'resumo' ? (
                                <ChevronUp className="h-5 w-5" />
                              ) : (
                                <ChevronDown className="h-5 w-5" />
                              )}
                            </div>
                          </CardHeader>
                          {expandedSection === 'resumo' && (
                            <CardContent>
                              <p className="text-sm leading-relaxed">
                                {selectedDocument.summary}
                              </p>
                            </CardContent>
                          )}
                        </Card>

                        <Card>
                          <CardHeader 
                            className={cn(
                              "pb-2 cursor-pointer",
                              expandedSection === 'highlights' ? "" : "pb-0"
                            )}
                            onClick={() => toggleSection('highlights')}
                          >
                            <div className="flex justify-between items-center">
                              <CardTitle className="text-lg flex items-center">
                                <AlertTriangle className="h-5 w-5 mr-2" />
                                Trechos Relevantes
                              </CardTitle>
                              {expandedSection === 'highlights' ? (
                                <ChevronUp className="h-5 w-5" />
                              ) : (
                                <ChevronDown className="h-5 w-5" />
                              )}
                            </div>
                          </CardHeader>
                          {expandedSection === 'highlights' && selectedDocument.highlights && (
                            <CardContent>
                              <div className="space-y-3">
                                {selectedDocument.highlights.map((highlight, index) => (
                                  <div 
                                    key={index} 
                                    className={cn(
                                      "p-3 border-l-4 bg-background rounded",
                                      highlight.importance === 'high' 
                                        ? "border-red-400" 
                                        : highlight.importance === 'medium'
                                          ? "border-amber-400"
                                          : "border-blue-400" 
                                    )}
                                  >
                                    <p className="text-sm italic">"{highlight.text}"</p>
                                    <div className="flex justify-between mt-1">
                                      <span className="text-xs text-muted-foreground">
                                        Página {highlight.page}
                                      </span>
                                      <Badge 
                                        variant="outline" 
                                        className={cn(
                                          "text-xs",
                                          highlight.importance === 'high' 
                                            ? "bg-red-50 text-red-800 border-red-200" 
                                            : highlight.importance === 'medium'
                                              ? "bg-amber-50 text-amber-800 border-amber-200"
                                              : "bg-blue-50 text-blue-800 border-blue-200" 
                                        )}
                                      >
                                        {highlight.importance === 'high' 
                                          ? 'Alta Relevância' 
                                          : highlight.importance === 'medium' 
                                            ? 'Relevância Média'
                                            : 'Relevância Baixa'
                                        }
                                      </Badge>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          )}
                        </Card>

                        <Card>
                          <CardHeader 
                            className={cn(
                              "pb-2 cursor-pointer",
                              expandedSection === 'keypoints' ? "" : "pb-0"
                            )}
                            onClick={() => toggleSection('keypoints')}
                          >
                            <div className="flex justify-between items-center">
                              <CardTitle className="text-lg flex items-center">
                                <Bookmark className="h-5 w-5 mr-2" />
                                Pontos Principais
                              </CardTitle>
                              {expandedSection === 'keypoints' ? (
                                <ChevronUp className="h-5 w-5" />
                              ) : (
                                <ChevronDown className="h-5 w-5" />
                              )}
                            </div>
                          </CardHeader>
                          {expandedSection === 'keypoints' && selectedDocument.keyPoints && (
                            <CardContent>
                              <div className="space-y-4">
                                {selectedDocument.keyPoints.map((point, index) => (
                                  <div key={index}>
                                    <h4 className="font-serif text-sm font-semibold mb-1">
                                      {point.title}
                                    </h4>
                                    <p className="text-sm">{point.description}</p>
                                    {index < selectedDocument.keyPoints!.length - 1 && (
                                      <Separator className="mt-3" />
                                    )}
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          )}
                        </Card>

                        <Card>
                          <CardHeader 
                            className={cn(
                              "pb-2 cursor-pointer",
                              expandedSection === 'content' ? "" : "pb-0"
                            )}
                            onClick={() => toggleSection('content')}
                          >
                            <div className="flex justify-between items-center">
                              <CardTitle className="text-lg flex items-center">
                                <FileText className="h-5 w-5 mr-2" />
                                Conteúdo Completo
                              </CardTitle>
                              {expandedSection === 'content' ? (
                                <ChevronUp className="h-5 w-5" />
                              ) : (
                                <ChevronDown className="h-5 w-5" />
                              )}
                            </div>
                          </CardHeader>
                          {expandedSection === 'content' && (
                            <CardContent>
                              <p className="text-sm whitespace-pre-line leading-relaxed">
                                {selectedDocument.content}
                              </p>
                            </CardContent>
                          )}
                        </Card>
                      </div>
                    </ScrollArea>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-64 bg-muted/30 rounded-lg border border-dashed">
                      <Loader2 className="h-10 w-10 text-eco-primary animate-spin mb-4" />
                      <h3 className="text-lg font-medium mb-1">Analisando documento</h3>
                      <p className="text-sm text-muted-foreground">
                        Isto pode levar alguns minutos...
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <FileText className="h-16 w-16 text-muted-foreground opacity-30 mb-4" />
                  <h3 className="text-lg font-medium mb-1">Nenhum documento selecionado</h3>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    Selecione um documento da lista ou faça upload de um novo documento para análise.
                  </p>
                </div>
              )}
            </div>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default DocumentReader;
