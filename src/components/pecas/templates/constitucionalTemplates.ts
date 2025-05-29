
import { Template } from '../types';

export const constitucionalTemplates: Template[] = [
  {
    id: '11',
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
    id: '12',
    nome: 'Mandado de Injunção',
    categoria: 'Constitucional',
    descricao: 'Remédio contra omissão do poder público.',
    campos: [
      { nome: 'Nome do Impetrante', tipo: 'texto', obrigatorio: true },
      { nome: 'Órgão Omisso', tipo: 'texto', obrigatorio: true },
      { nome: 'Direito Constitucional', tipo: 'texto', obrigatorio: true },
      { nome: 'Norma Regulamentadora Faltante', tipo: 'texto', obrigatorio: true }
    ]
  }
];
