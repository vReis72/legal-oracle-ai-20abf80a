
import { Template } from '../types';

export const administrativoTemplates: Template[] = [
  {
    id: '20',
    nome: 'Impugnação de Edital',
    categoria: 'Administrativo',
    descricao: 'Contestação de edital de licitação.',
    campos: [
      { nome: 'Nome da Empresa', tipo: 'texto', obrigatorio: true },
      { nome: 'Órgão Licitante', tipo: 'texto', obrigatorio: true },
      { nome: 'Número do Edital', tipo: 'texto', obrigatorio: true },
      { nome: 'Vícios Alegados', tipo: 'texto', obrigatorio: true }
    ]
  },
  {
    id: '21',
    nome: 'Recurso Administrativo',
    categoria: 'Administrativo',
    descricao: 'Recurso contra decisão administrativa.',
    campos: [
      { nome: 'Nome do Requerente', tipo: 'texto', obrigatorio: true },
      { nome: 'Órgão Julgador', tipo: 'texto', obrigatorio: true },
      { nome: 'Número do Processo', tipo: 'texto', obrigatorio: true },
      { nome: 'Fundamentos do Recurso', tipo: 'texto', obrigatorio: true }
    ]
  }
];
