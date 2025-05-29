
import { Template } from '../types';

export const trabalhistaTemplates: Template[] = [
  {
    id: '5',
    nome: 'Reclamação Trabalhista',
    categoria: 'Trabalhista',
    descricao: 'Petição inicial para reclamação na Justiça do Trabalho.',
    campos: [
      { nome: 'Nome do Trabalhador', tipo: 'texto', obrigatorio: true },
      { nome: 'Nome da Empresa', tipo: 'texto', obrigatorio: true },
      { nome: 'CNPJ da Empresa', tipo: 'texto', obrigatorio: true },
      { nome: 'Período de Trabalho', tipo: 'texto', obrigatorio: true },
      { nome: 'Função Exercida', tipo: 'texto', obrigatorio: true },
      { nome: 'Pedidos', tipo: 'texto', obrigatorio: true }
    ]
  },
  {
    id: '6',
    nome: 'Defesa Trabalhista',
    categoria: 'Trabalhista',
    descricao: 'Contestação para reclamações trabalhistas.',
    campos: [
      { nome: 'Nome da Empresa', tipo: 'texto', obrigatorio: true },
      { nome: 'Nome do Reclamante', tipo: 'texto', obrigatorio: true },
      { nome: 'Argumentos de Defesa', tipo: 'texto', obrigatorio: true },
      { nome: 'Documentos Anexos', tipo: 'texto', obrigatorio: false }
    ]
  }
];
