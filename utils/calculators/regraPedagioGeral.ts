import { FormState, RegraResultado } from '../../types';
import { createReq } from './helper';
import { formatDaysToYMD } from '../calculoDatas';

export const avaliarRegraPedagioGeral = (
  data: FormState, 
  idadeAnos: number, 
  tempoContribDias: number, 
  metaOriginalDias: number, 
  pedagioDias: number
): RegraResultado[] => {
  const isHomem = data.sexo === 'Masculino';
  const tempoContribAnos = Math.floor(tempoContribDias / 365);
  const metaTotalComPedagio = metaOriginalDias + pedagioDias;
  
  // Parâmetros Homem/Mulher
  const idadeMinima = isHomem ? 60 : 55;
  const tempoMinimo = isHomem ? 35 : 30;

  // Verificações Comuns
  const cumpreIdade = idadeAnos >= idadeMinima;
  const cumpreContrib = tempoContribAnos >= tempoMinimo;
  const cumpreSvcPublico = data.dezAnosServicoPublico;
  const cumpreCargoEfetivo = data.cincoAnosCargoEfetivo;
  const cumpreTempoTotal = tempoContribDias >= metaTotalComPedagio;
  const isProfessor = data.tipoServidor === 'PEBPM';

  const buildBaseRequisitos = () => [
    createReq("É professor (PEBPM)", isProfessor ? "Sim" : "Não", isProfessor ? "Sim" : "Não", true),
    createReq("Idade mínima", idadeMinima, idadeAnos, cumpreIdade),
    createReq("Tempo mínimo de contribuição", tempoMinimo, tempoContribAnos, cumpreContrib),
    createReq("Tempo no serviço público (10a)", "10 anos", data.dezAnosServicoPublico ? "Sim" : "Não", cumpreSvcPublico),
    createReq("Tempo no cargo efetivo (5a)", "05 anos", data.cincoAnosCargoEfetivo ? "Sim" : "Não", cumpreCargoEfetivo),
    createReq("Pedágio (Cumprimento)", formatDaysToYMD(metaTotalComPedagio), formatDaysToYMD(tempoContribDias), cumpreTempoTotal),
    createReq("Valor do Pedágio Calculado", "-", `${pedagioDias} dias`, true)
  ];

  const regras: RegraResultado[] = [];

  // Regra 1 - Integral / Paridade (Ingresso até 31/12/2003)
  const cumpreR1 = data.ingressouAte2003 && cumpreIdade && cumpreContrib && cumpreSvcPublico && cumpreCargoEfetivo && cumpreTempoTotal;
  regras.push({
    nome: "Regra 1 - Transição - Pedágio - Geral - Integral - Com paridade",
    descricao: "Ingresso até 31/12/2003. Pedágio de 50%. Direito a Integralidade e Paridade.",
    cumpre: cumpreR1,
    requisitos: [
      createReq("Ingresso em cargo efetivo até", "31/12/2003", data.ingressouAte2003 ? "Sim" : "Não", data.ingressouAte2003),
      ...buildBaseRequisitos()
    ]
  });

  // Regra 2 - Média Integral (Ingresso entre 2004 e 2020)
  const cumpreR2 = data.ingressouEntre2003e2020 && cumpreIdade && cumpreContrib && cumpreSvcPublico && cumpreCargoEfetivo && cumpreTempoTotal;
  regras.push({
    nome: "Regra 2 - Transição - Pedágio - Geral - Média integral - Sem paridade",
    descricao: "Ingresso entre 01/01/2004 e 15/09/2020. Pedágio de 50%. Cálculo pela média.",
    cumpre: cumpreR2,
    requisitos: [
      createReq("Ingresso em cargo efetivo até", "Entre 2004 e 2020", data.ingressouEntre2003e2020 ? "Sim" : "Não", data.ingressouEntre2003e2020),
      ...buildBaseRequisitos()
    ]
  });

  return regras;
};