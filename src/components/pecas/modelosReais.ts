
import { Template } from "./types";

// Exemplos reais e amplos, fácil de expandir com mais templates reais depois
export const modelosReais: Template[] = [
  // DIREITO CIVIL
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
  },

  // DIREITO TRABALHISTA
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
  },

  // DIREITO PENAL
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
  },

  // DIREITO DE FAMÍLIA
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
  },

  // DIREITO CONSTITUCIONAL
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
  },

  // DIREITO EMPRESARIAL
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
  },

  // DIREITO RECURSAL
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
  },

  // DIREITO CONTRATUAL
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
  },

  // DIREITO ADMINISTRATIVO
  {
    id: '20',
    nome: 'Impugnação de Edital',
    categoria: 'Administrativo',
    descricao: 'Contestação de edital de licitação.',
    campos: [
      { nome: 'Nome da Empresa', tipo: 'texto', obrigatorio: true },
      { nome: 'Órgão Licitante', tipo: 'texto', obrigatorio: true },
      { nome: 'Número do Edital', tipo: 'texto', obrigatorio: true },
      { nome: 'Vícios Alegados', tipo: 'texto', obrigatorio: true }
    ]
  },
  {
    id: '21',
    nome: 'Recurso Administrativo',
    categoria: 'Administrativo',
    descricao: 'Recurso contra decisão administrativa.',
    campos: [
      { nome: 'Nome do Requerente', tipo: 'texto', obrigatorio: true },
      { nome: 'Órgão Julgador', tipo: 'texto', obrigatorio: true },
      { nome: 'Número do Processo', tipo: 'texto', obrigatorio: true },
      { nome: 'Fundamentos do Recurso', tipo: 'texto', obrigatorio: true }
    ]
  }
];
