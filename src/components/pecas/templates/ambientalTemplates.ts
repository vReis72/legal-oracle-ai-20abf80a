
import { Template } from '../types';

export const ambientalTemplates: Template[] = [
  {
    id: '22',
    nome: 'Ação Civil Pública Ambiental',
    categoria: 'Ambiental',
    descricao: 'Petição para proteção do meio ambiente.',
    campos: [
      { nome: 'Nome do Autor', tipo: 'texto', obrigatorio: true },
      { nome: 'Órgão/Empresa Ré', tipo: 'texto', obrigatorio: true },
      { nome: 'Dano Ambiental', tipo: 'texto', obrigatorio: true },
      { nome: 'Local do Dano', tipo: 'texto', obrigatorio: true },
      { nome: 'Medidas Reparatórias', tipo: 'texto', obrigatorio: true }
    ]
  },
  {
    id: '23',
    nome: 'Mandado de Segurança Ambiental',
    categoria: 'Ambiental',
    descricao: 'Contra omissão de órgão ambiental.',
    campos: [
      { nome: 'Nome do Impetrante', tipo: 'texto', obrigatorio: true },
      { nome: 'Autoridade Coatora', tipo: 'texto', obrigatorio: true },
      { nome: 'Licença/Autorização', tipo: 'texto', obrigatorio: true },
      { nome: 'Protocolo/Processo', tipo: 'texto', obrigatorio: true }
    ]
  },
  {
    id: '24',
    nome: 'Contestação de Auto de Infração Ambiental',
    categoria: 'Ambiental',
    descricao: 'Defesa contra multa ambiental.',
    campos: [
      { nome: 'Nome do Autuado', tipo: 'texto', obrigatorio: true },
      { nome: 'Órgão Autuador', tipo: 'texto', obrigatorio: true },
      { nome: 'Número do Auto', tipo: 'texto', obrigatorio: true },
      { nome: 'Data da Autuação', tipo: 'data', obrigatorio: true },
      { nome: 'Valor da Multa', tipo: 'texto', obrigatorio: true },
      { nome: 'Fundamentos da Defesa', tipo: 'texto', obrigatorio: true }
    ]
  },
  {
    id: '25',
    nome: 'Licenciamento Ambiental',
    categoria: 'Ambiental',
    descricao: 'Requerimento de licença ambiental.',
    campos: [
      { nome: 'Nome do Requerente', tipo: 'texto', obrigatorio: true },
      { nome: 'Tipo de Atividade', tipo: 'texto', obrigatorio: true },
      { nome: 'Localização do Empreendimento', tipo: 'texto', obrigatorio: true },
      { nome: 'Tipo de Licença', tipo: 'opcao', obrigatorio: true, opcoes: ['Licença Prévia', 'Licença de Instalação', 'Licença de Operação'] }
    ]
  }
];
