import { FormState, RegraResultado } from '../../types';
import { createReq } from './helper';
import { formatDaysToYMD } from '../calculoDatas';

export const avaliarRegraPedagioProfessor = (
  data: FormState,
  idadeAnos: number,
  tempoContribDias: number,
  pedagioDias: number
): RegraResultado[] => {
  const isProfessor = data.tipoServidor === 'PEBPM';
  const isHomem = data.sexo === 'Masculino';
  
  // Se não for professor, exibe informação e encerra
  if (!isProfessor) {
    const msgNaoSeAplica = "Essa regra somente se aplica apenas a Professores.";
    return [
      {
        nome: "Regra 3 - Transição - Pedágio - Especial de Professor - Integral - Com paridade",
        descricao: "Destinada apenas ao cargo de PEBPM.",
        cumpre: false,
        requisitos: [createReq("É professor (PEBPM)", "Sim", "Não (" + msgNaoSeAplica + ")", false)]
      },
      {
        nome: "Regra 4 - Transição - Pedágio - Especial de Professor - Média integral - Sem paridade",
        descricao: "Destinada apenas ao cargo de PEBPM.",
        cumpre: false,
        requisitos: [createReq("É professor (PEBPM)", "Sim", "Não (" + msgNaoSeAplica + ")", false)]
      }
    ];
  }

  // Parâmetros Homem/Mulher Professor
  const idadeMinima = isHomem ? 55 : 50;
  const regenciaMinima = isHomem ? 30 : 25;
  const metaDocenteDias = regenciaMinima * 365;
  const metaTotalComPedagio = metaDocenteDias + pedagioDias;

  // Verificações
  const cumpreIdade = idadeAnos >= idadeMinima;
  const cumpreRegencia = data.TempoDeRegência >= regenciaMinima;
  const cumpreSvcPublico = data.dezAnosServicoPublico;
  const cumpreCargoEfetivo = data.cincoAnosCargoEfetivo;
  const cumpreTempoTotal = tempoContribDias >= metaTotalComPedagio;

  const buildBaseRequisitos = () => [
    createReq("É professor (PEBPM)", "Sim", "Sim", true),
    createReq("Idade mínima", idadeMinima, idadeAnos, cumpreIdade),
    createReq("Tempo regência (Docente)", regenciaMinima, data.TempoDeRegência, cumpreRegencia),
    createReq("Tempo no serviço público (10a)", "10 anos", data.dezAnosServicoPublico ? "Sim" : "Não", cumpreSvcPublico),
    createReq("Tempo no cargo efetivo (5a)", "05 anos", data.cincoAnosCargoEfetivo ? "Sim" : "Não", cumpreCargoEfetivo),
    createReq("Pedágio (Cumprimento)", formatDaysToYMD(metaTotalComPedagio), formatDaysToYMD(tempoContribDias), cumpreTempoTotal),
    createReq("Valor do Pedágio Calculado", "-", `${pedagioDias} dias`, true)
  ];

  const regras: RegraResultado[] = [];

  // Regra 3 - Professor Integral (Ingresso até 2003)
  const cumpreR3 = data.ingressouAte2003 && cumpreIdade && cumpreRegencia && cumpreSvcPublico && cumpreCargoEfetivo && cumpreTempoTotal;
  regras.push({
    nome: "Regra 3 - Transição - Pedágio - Especial de Professor - Integral - Com paridade",
    descricao: "Exclusivo PEBPM. Ingresso até 31/12/2003. Regência mínima.",
    cumpre: cumpreR3,
    requisitos: [
      createReq("Ingresso em cargo efetivo até", "31/12/2003", data.ingressouAte2003 ? "Sim" : "Não", data.ingressouAte2003),
      ...buildBaseRequisitos()
    ]
  });

  // Regra 4 - Professor Média (Ingresso entre 2004 e 2020)
  const cumpreR4 = data.ingressouEntre2003e2020 && cumpreIdade && cumpreRegencia && cumpreSvcPublico && cumpreCargoEfetivo && cumpreTempoTotal;
  regras.push({
    nome: "Regra 4 - Transição - Pedágio - Especial de Professor - Média integral - Sem paridade",
    descricao: "Exclusivo PEBPM. Ingresso entre 01/01/2004 e 15/09/2020.",
    cumpre: cumpreR4,
    requisitos: [
      createReq("Ingresso em cargo efetivo até", "Entre 2004 e 2020", data.ingressouEntre2003e2020 ? "Sim" : "Não", data.ingressouEntre2003e2020),
      ...buildBaseRequisitos()
    ]
  });

  return regras;
};