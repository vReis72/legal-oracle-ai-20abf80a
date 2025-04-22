
import { Template } from "./types";

// Exemplos reais e amplos, fácil de expandir com mais templates reais depois
export const modelosReais: Template[] = [
  {
    id: '1',
    nome: 'Petição Inicial',
    categoria: 'Cível',
    descricao: 'Modelo genérico de petição inicial para ações judiciais.',
    campos: [
      { nome: 'Nome do Autor', tipo: 'texto', obrigatorio: true },
      { nome: 'Nome do Réu', tipo: 'texto', obrigatorio: true },
      { nome: 'Número do Processo', tipo: 'texto', obrigatorio: false },
      { nome: 'Objeto', tipo: 'texto', obrigatorio: true },
      { nome: 'Fundamentação', tipo: 'texto', obrigatorio: true }
    ]
  },
  {
    id: '2',
    nome: 'Contestação',
    categoria: 'Cível',
    descricao: 'Modelo genérico para contestação em qualquer juízo.',
    campos: [
      { nome: 'Nome do Réu', tipo: 'texto', obrigatorio: true },
      { nome: 'Nome do Autor', tipo: 'texto', obrigatorio: true },
      { nome: 'Fundamentos da Defesa', tipo: 'texto', obrigatorio: true }
    ]
  },
  {
    id: '3',
    nome: 'Recurso de Apelação',
    categoria: 'Recursal',
    descricao: 'Modelo para apelações diversas.',
    campos: [
      { nome: 'Nome da Parte Apelante', tipo: 'texto', obrigatorio: true },
      { nome: 'Nome da Parte Apelada', tipo: 'texto', obrigatorio: true },
      { nome: 'Motivos da Apelação', tipo: 'texto', obrigatorio: true }
    ]
  },
  {
    id: '4',
    nome: 'Mandado de Segurança',
    categoria: 'Constitucional',
    descricao: 'Modelo básico para mandado de segurança.',
    campos: [
      { nome: 'Nome do Impetrante', tipo: 'texto', obrigatorio: true },
      { nome: 'Autoridade Coatora', tipo: 'texto', obrigatorio: true },
      { nome: 'Direito Violado', tipo: 'texto', obrigatorio: true }
    ]
  },
  {
    id: '5',
    nome: 'Acordo Extrajudicial',
    categoria: 'Contratual',
    descricao: 'Minuta abrangente para conciliação entre partes.',
    campos: [
      { nome: 'Nome da Parte 1', tipo: 'texto', obrigatorio: true },
      { nome: 'Nome da Parte 2', tipo: 'texto', obrigatorio: true },
      { nome: 'Objeto do Acordo', tipo: 'texto', obrigatorio: true }
    ]
  },
  // Adicione aqui outros modelos "reais" e amplos, para diferentes áreas (Trabalhista, Penal, Família, Empresarial, etc)
];

