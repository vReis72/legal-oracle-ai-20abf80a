
import { Template } from '../types';

export const penalTemplates: Template[] = [
  {
    id: '7',
    nome: 'Queixa-Crime',
    categoria: 'Penal',
    descricao: 'Petição para crimes de ação penal privada.',
    campos: [
      { nome: 'Nome do Querelante', tipo: 'texto', obrigatorio: true },
      { nome: 'Nome do Querelado', tipo: 'texto', obrigatorio: true },
      { nome: 'Tipo de Crime', tipo: 'texto', obrigatorio: true },
      { nome: 'Data dos Fatos', tipo: 'data', obrigatorio: true },
      { nome: 'Descrição dos Fatos', tipo: 'texto', obrigatorio: true }
    ]
  },
  {
    id: '8',
    nome: 'Habeas Corpus',
    categoria: 'Penal',
    descricao: 'Remédio constitucional contra prisão ilegal.',
    campos: [
      { nome: 'Nome do Paciente', tipo: 'texto', obrigatorio: true },
      { nome: 'Autoridade Coatora', tipo: 'texto', obrigatorio: true },
      { nome: 'Motivo da Prisão', tipo: 'texto', obrigatorio: true },
      { nome: 'Ilegalidade Alegada', tipo: 'texto', obrigatorio: true }
    ]
  }
];
