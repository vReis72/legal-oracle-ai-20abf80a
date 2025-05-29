
import { Template } from '../types';

export const civilTemplates: Template[] = [
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
    nome: 'Ação de Cobrança',
    categoria: 'Cível',
    descricao: 'Petição inicial para cobrança de valores em atraso.',
    campos: [
      { nome: 'Nome do Credor', tipo: 'texto', obrigatorio: true },
      { nome: 'Nome do Devedor', tipo: 'texto', obrigatorio: true },
      { nome: 'Valor da Dívida', tipo: 'numero', obrigatorio: true },
      { nome: 'Data do Vencimento', tipo: 'data', obrigatorio: true },
      { nome: 'Origem da Dívida', tipo: 'texto', obrigatorio: true }
    ]
  },
  {
    id: '4',
    nome: 'Ação de Despejo',
    categoria: 'Cível',
    descricao: 'Petição para retomada de imóvel locado.',
    campos: [
      { nome: 'Nome do Locador', tipo: 'texto', obrigatorio: true },
      { nome: 'Nome do Locatário', tipo: 'texto', obrigatorio: true },
      { nome: 'Endereço do Imóvel', tipo: 'texto', obrigatorio: true },
      { nome: 'Motivo do Despejo', tipo: 'opcao', obrigatorio: true, opcoes: ['Falta de Pagamento', 'Fim do Contrato', 'Infração Contratual', 'Uso Indevido'] },
      { nome: 'Valor do Aluguel', tipo: 'numero', obrigatorio: false }
    ]
  }
];
