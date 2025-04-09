
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { processDocument, determineDocumentType } from '@/services/documentService';
import { Document } from '@/types/document';

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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
          
          // Create new document
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
          setUploading(false);
          setUploadProgress(0);
          
          // Process the document with OpenAI
          const reader = new FileReader();
          reader.onload = async (event) => {
            if (event.target?.result) {
              try {
                const fileContent = event.target.result as string;
                
                // Process document using OpenAI
                const analysis = await processDocument(fileContent, file.name, documentType);
                
                // Update document with analysis results
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
                  title: "Documento analisado com sucesso",
                  description: "O documento foi processado e analisado pela IA.",
                });
              } catch (error) {
                console.error('Erro ao processar o documento:', error);
                toast({
                  variant: "destructive",
                  title: "Erro ao processar documento",
                  description: error instanceof Error ? error.message : "Ocorreu um erro durante a análise do documento.",
                });
                
                // Mark as processed but with error
                setDocuments(prev => prev.map(doc => 
                  doc.id === newDocument.id 
                    ? {
                        ...doc,
                        processed: true,
                        content: "Ocorreu um erro ao processar este documento.",
                        summary: "Não foi possível gerar o resumo devido a um erro.",
                      } 
                    : doc
                ));
              }
            }
          };
          
          reader.readAsText(file);
        }
      }, 100);
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
