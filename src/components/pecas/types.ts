
export interface Template {
  id: string;
  nome: string;
  categoria: string;
  descricao: string;
  campos: { nome: string; tipo: 'texto' | 'data' | 'numero' | 'opcao'; obrigatorio: boolean; opcoes?: string[] }[];
}

export interface Peca {
  id: string;
  nome: string;
  template: string;
  dataCriacao: Date;
  status: 'rascunho' | 'concluida';
  conteudo?: string;
}

