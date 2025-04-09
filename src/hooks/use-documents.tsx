
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { processDocument, determineDocumentType } from '@/services/documentService';
import { Document } from '@/types/document';
import { useApiKey } from '@/context/ApiKeyContext';

// Sample initial documents for demonstration
const initialDocuments: Document[] = [
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
];

export const useDocuments = () => {
  const [documents, setDocuments] = useState<Document[]>(initialDocuments);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const { toast } = useToast();
  const { isKeyConfigured } = useApiKey();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isKeyConfigured) {
      toast({
        variant: "destructive",
        title: "API Key não configurada",
        description: "Configure sua chave da API OpenAI antes de fazer upload de documentos.",
      });
      return;
    }

    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Verificar o tamanho do arquivo - limitar a 2MB para evitar problemas
      if (file.size > 2 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "Arquivo muito grande",
          description: "Por favor, selecione um arquivo menor que 2MB para análise rápida.",
        });
        return;
      }
      
      setUploading(true);
      
      // Simulação de progresso de upload mais realista
      const simulateUpload = () => {
        let progress = 0;
        const interval = setInterval(() => {
          progress += 5;
          setUploadProgress(Math.min(progress, 99)); // Não chega a 100% até o processamento terminar
          
          if (progress >= 99) {
            clearInterval(interval);
          }
        }, 100);
        return interval;
      };
      
      const uploadInterval = simulateUpload();
      
      try {
        // Criar novo documento
        const documentType = determineDocumentType(file.name);
        const newDocument: Document = {
          id: Date.now().toString(),
          name: file.name,
          type: documentType,
          uploadDate: new Date(),
          processed: false
        };
        
        setDocuments(prev => [newDocument, ...prev]);
        setSelectedDocument(newDocument);
        
        // Ler o conteúdo do arquivo
        const fileContent = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (event) => {
            if (event.target?.result) {
              resolve(event.target.result as string);
            } else {
              reject(new Error("Falha ao ler o arquivo"));
            }
          };
          reader.onerror = () => reject(new Error("Erro ao ler o arquivo"));
          reader.readAsText(file);
        });
        
        // Processar o documento com timeout limitado
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error("Tempo limite excedido")), 25000);
        });
        
        const analysisPromise = processDocument(fileContent, file.name, documentType);
        
        // Race para garantir que não ficará processando indefinidamente
        const analysis = await Promise.race([analysisPromise, timeoutPromise])
          .catch(error => {
            console.error("Erro ou timeout no processamento:", error);
            
            // Notificar usuário do erro
            toast({
              variant: "destructive",
              title: "Erro no processamento",
              description: "O processamento do documento demorou muito. Tente um arquivo menor ou em formato texto.",
            });
            
            // Retorna uma análise parcial
            return {
              summary: "O processamento excedeu o tempo limite. Tente um documento menor.",
              highlights: [],
              keyPoints: [{ 
                title: "Processamento interrompido", 
                description: "O documento pode ser muito grande ou complexo para análise." 
              }],
              content: fileContent.substring(0, 500) + "\n\n[Conteúdo truncado]"
            };
          });
        
        // Atualizar documento com resultados
        clearInterval(uploadInterval);
        setUploadProgress(100);
        
        // Pequeno delay antes de mostrar como concluído
        setTimeout(() => {
          setDocuments(prev => prev.map(doc => 
            doc.id === newDocument.id 
              ? {
                  ...doc,
                  processed: true,
                  content: analysis.content,
                  summary: analysis.summary,
                  highlights: analysis.highlights,
                  keyPoints: analysis.keyPoints
                } 
              : doc
          ));
          
          toast({
            title: "Documento processado",
            description: "O documento foi analisado com sucesso.",
          });
          
          setUploading(false);
        }, 500);
        
      } catch (error) {
        clearInterval(uploadInterval);
        console.error('Erro no processamento:', error);
        
        // Notificar usuário do erro
        toast({
          variant: "destructive",
          title: "Falha no processamento",
          description: error instanceof Error 
            ? `Erro: ${error.message}` 
            : "Ocorreu um erro inesperado durante o processamento.",
        });
        
        // Atualizar documento com status de erro
        setDocuments(prev => prev.map(doc => 
          doc.id === selectedDocument?.id 
            ? {
                ...doc,
                processed: true,
                content: "Erro no processamento deste documento.",
                summary: "Não foi possível analisar este documento devido a um erro.",
              } 
            : doc
        ));
        
        setUploading(false);
        setUploadProgress(0);
      }
    }
  };

  return {
    documents,
    uploading,
    uploadProgress,
    selectedDocument,
    setSelectedDocument,
    handleFileUpload
  };
};
