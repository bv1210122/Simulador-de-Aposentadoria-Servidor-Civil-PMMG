
export type TipoServidor = 'PEBPM' | 'EEBPM' | 'ASPM' | 'AAPM' | 'AGPM';
export type Sexo = 'Masculino' | 'Feminino';

export interface Averbação {
  id: string;
  regime: 'RGPS' | 'RPPS' | '';
  origem: string;
  funcao: string;
  dataAverbacao: string; // Data de publicação/registro da averbação
  anos: number;
  dias: number;
}

export interface Desconto {
  id: string;
  tipo: string;
  dias: number;
}

export interface FormState {
  tipoServidor: TipoServidor | '';
  sexo: Sexo | '';
  dataSimulacao: string;
  dataNascimento: string;
  dataInclusaoPMMG: string;
  averbacoes: Averbação[];
  descontos: Desconto[];
  ingressouAte2003: boolean;
  ingressouEntre2003e2020: boolean;
  dezAnosServicoPublico: boolean;
  cincoAnosCargoEfetivo: boolean;
  tempoRegencia: number;
}

export interface Requisito {
  label: string;
  esperado: string;
  atual: string;
  cumpre: boolean;
}

export interface RegraResultado {
  nome: string;
  descricao: string;
  cumpre: boolean;
  requisitos: Requisito[];
}

export interface CalculosFinais {
  idadeDias: number;
  idadeFormatada: string;
  tempoServicoPMMGDias: number;
  totalTempoAverbado: number;
  totalTempoDescontado: number;
  tempoEfetivoCivilPMMG: number;
  tempoContribuicaoTotal: number;
  pontuacao: number;
  pontuacaoSaldoDias: number;
  pedagioApurado: number;
  tempoACumprir: number;
  dataPrevistaAposentadoria: string;
  data75Anos: string;
  tempoEfetivo15092020: number;
  tempoMinimoExigidoDias: number;
  saldoFaltanteCorte: number;
  diasCumpridosPosCorte: number;
}
