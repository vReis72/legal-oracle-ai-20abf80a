
import { Template } from '../types';

export const contratualTemplates: Template[] = [
  {
    id: '18',
    nome: 'Acordo Extrajudicial',
    categoria: 'Contratual',
    descricao: 'Minuta abrangente para conciliação entre partes.',
    campos: [
      { nome: 'Nome da Parte 1', tipo: 'texto', obrigatorio: true },
      { nome: 'Nome da Parte 2', tipo: 'texto', obrigatorio: true },
      { nome: 'Objeto do Acordo', tipo: 'texto', obrigatorio: true }
    ]
  },
  {
    id: '19',
    nome: 'Rescisão Contratual',
    categoria: 'Contratual',
    descricao: 'Notificação para rescisão de contrato.',
    campos: [
      { nome: 'Nome do Contratante', tipo: 'texto', obrigatorio: true },
      { nome: 'Nome do Contratado', tipo: 'texto', obrigatorio: true },
      { nome: 'Tipo de Contrato', tipo: 'texto', obrigatorio: true },
      { nome: 'Data do Contrato', tipo: 'data', obrigatorio: true },
      { nome: 'Motivo da Rescisão', tipo: 'texto', obrigatorio: true }
    ]
  }
];
