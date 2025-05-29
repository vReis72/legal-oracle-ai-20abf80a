
import { Template } from '../types';

export const familiaTemplates: Template[] = [
  {
    id: '9',
    nome: 'Ação de Divórcio',
    categoria: 'Família',
    descricao: 'Petição para dissolução do casamento.',
    campos: [
      { nome: 'Nome do Requerente', tipo: 'texto', obrigatorio: true },
      { nome: 'Nome do Cônjuge', tipo: 'texto', obrigatorio: true },
      { nome: 'Data do Casamento', tipo: 'data', obrigatorio: true },
      { nome: 'Regime de Bens', tipo: 'opcao', obrigatorio: true, opcoes: ['Comunhão Parcial', 'Comunhão Universal', 'Separação Total', 'Participação Final'] },
      { nome: 'Filhos Menores', tipo: 'opcao', obrigatorio: true, opcoes: ['Sim', 'Não'] },
      { nome: 'Pensão Alimentícia', tipo: 'opcao', obrigatorio: false, opcoes: ['Sim', 'Não'] }
    ]
  },
  {
    id: '10',
    nome: 'Ação de Alimentos',
    categoria: 'Família',
    descricao: 'Petição para fixação ou revisão de pensão alimentícia.',
    campos: [
      { nome: 'Nome do Alimentando', tipo: 'texto', obrigatorio: true },
      { nome: 'Nome do Alimentante', tipo: 'texto', obrigatorio: true },
      { nome: 'Grau de Parentesco', tipo: 'opcao', obrigatorio: true, opcoes: ['Filho(a)', 'Cônjuge', 'Ex-cônjuge', 'Pai/Mãe', 'Outro'] },
      { nome: 'Valor Solicitado', tipo: 'numero', obrigatorio: false },
      { nome: 'Necessidades do Alimentando', tipo: 'texto', obrigatorio: true },
      { nome: 'Possibilidades do Alimentante', tipo: 'texto', obrigatorio: true }
    ]
  }
];
