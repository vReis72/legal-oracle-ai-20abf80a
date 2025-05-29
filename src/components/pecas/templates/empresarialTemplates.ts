
import { Template } from '../types';

export const empresarialTemplates: Template[] = [
  {
    id: '13',
    nome: 'Recuperação Judicial',
    categoria: 'Empresarial',
    descricao: 'Petição para recuperação de empresa em crise.',
    campos: [
      { nome: 'Razão Social da Empresa', tipo: 'texto', obrigatorio: true },
      { nome: 'CNPJ', tipo: 'texto', obrigatorio: true },
      { nome: 'Valor Total das Dívidas', tipo: 'numero', obrigatorio: true },
      { nome: 'Número de Credores', tipo: 'numero', obrigatorio: true },
      { nome: 'Plano de Recuperação', tipo: 'texto', obrigatorio: true }
    ]
  },
  {
    id: '14',
    nome: 'Dissolução de Sociedade',
    categoria: 'Empresarial',
    descricao: 'Petição para dissolução de sociedade empresária.',
    campos: [
      { nome: 'Razão Social', tipo: 'texto', obrigatorio: true },
      { nome: 'Nome dos Sócios', tipo: 'texto', obrigatorio: true },
      { nome: 'Motivo da Dissolução', tipo: 'opcao', obrigatorio: true, opcoes: ['Acordo entre sócios', 'Fim do prazo', 'Impossibilidade do objeto', 'Quebra da affectio societatis'] },
      { nome: 'Forma de Liquidação', tipo: 'texto', obrigatorio: true }
    ]
  }
];
