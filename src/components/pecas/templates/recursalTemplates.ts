
import { Template } from '../types';

export const recursalTemplates: Template[] = [
  {
    id: '15',
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
    id: '16',
    nome: 'Recurso Especial',
    categoria: 'Recursal',
    descricao: 'Recurso para o Superior Tribunal de Justiça.',
    campos: [
      { nome: 'Nome do Recorrente', tipo: 'texto', obrigatorio: true },
      { nome: 'Nome do Recorrido', tipo: 'texto', obrigatorio: true },
      { nome: 'Violação à Lei Federal', tipo: 'texto', obrigatorio: true },
      { nome: 'Precedentes do STJ', tipo: 'texto', obrigatorio: false }
    ]
  },
  {
    id: '17',
    nome: 'Recurso Extraordinário',
    categoria: 'Recursal',
    descricao: 'Recurso para o Supremo Tribunal Federal.',
    campos: [
      { nome: 'Nome do Recorrente', tipo: 'texto', obrigatorio: true },
      { nome: 'Nome do Recorrido', tipo: 'texto', obrigatorio: true },
      { nome: 'Questão Constitucional', tipo: 'texto', obrigatorio: true },
      { nome: 'Repercussão Geral', tipo: 'texto', obrigatorio: true }
    ]
  }
];
