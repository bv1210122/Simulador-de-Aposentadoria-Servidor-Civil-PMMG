import { FormState, RegraResultado } from '../../types';
import { getMetaPontosGeral } from './pontos';
import { createReq } from './helper';

export const avaliarRegraPontosGeral = (
  data: FormState,
  dataSimulacao: Date,
  idadeAnos: number,
  tempoContribAnos: number,
  pontuacaoAtual: number
): RegraResultado[] => {
  const isHomem = data.sexo === 'Masculino';
  const meta = getMetaPontosGeral(data.sexo!, dataSimulacao);
  const isProfessor = data.tipoServidor === 'PEBPM';

  // Parâmetros de Idade
  const idadeMinR1 = isHomem ? 65 : 60;
  const idadeMinR2 = isHomem ? 62 : 56;
  const tempoMin = isHomem ? 35 : 30;

  // Requisitos Comuns
  const cumpreTempoContrib = tempoContribAnos >= tempoMin;
  const cumpreSvcPublico = data.dezAnosServicoPublico;
  const cumpreCargoEfetivo = data.cincoAnosCargoEfetivo;
  const cumprePontos = pontuacaoAtual >= meta.pontos;

  const regras: RegraResultado[] = [];

  // REGRA 1: Integral - Com Paridade
  const cumpreIdadeR1 = idadeAnos >= idadeMinR1;
  const cumpreR1 = data.ingressouAte2003 && cumpreIdadeR1 && cumpreTempoContrib && cumpreSvcPublico && cumpreCargoEfetivo && cumprePontos;

  regras.push({
    nome: "Regra 1 - Transição - Pontos - Geral - Integral - Com paridade",
    descricao: "Ingresso até 31/12/2003. Soma da idade + tempo. Direito a integralidade e paridade.",
    cumpre: cumpreR1,
    requisitos: [
      createReq("É professor (PEBPM)", isProfessor ? "Sim" : "Não", isProfessor ? "Sim" : "Não", true),
      createReq("Ingresso até 31/12/2003", "Sim", data.ingressouAte2003 ? "Sim" : "Não", data.ingressouAte2003),
      createReq("Idade mínima", idadeMinR1, idadeAnos, cumpreIdadeR1),
      createReq("Tempo mínimo contribuição", tempoMin, tempoContribAnos, cumpreTempoContrib),
      createReq("Tempo serviço público (10a)", "10 anos", data.dezAnosServicoPublico ? "Sim" : "Não", cumpreSvcPublico),
      createReq("Tempo cargo efetivo (5a)", "05 anos", data.cincoAnosCargoEfetivo ? "Sim" : "Não", cumpreCargoEfetivo),
      createReq(meta.label, meta.pontos, pontuacaoAtual, cumprePontos)
    ]
  });

  // REGRA 2: Média Integral - Sem Paridade
  const cumpreIdadeR2 = idadeAnos >= idadeMinR2;
  const cumpreR2 = data.ingressouEntre2003e2020 && cumpreIdadeR2 && cumpreTempoContrib && cumpreSvcPublico && cumpreCargoEfetivo && cumprePontos;

  regras.push({
    nome: "Regra 2 - Transição - Pontos - Geral - Média integral - Sem paridade",
    descricao: "Ingresso entre 01/01/2004 e 15/09/2020. Soma da idade + tempo. Cálculo pela média.",
    cumpre: cumpreR2,
    requisitos: [
      createReq("Ingresso após 31/12/03 e até 15/09/20", "Sim", data.ingressouEntre2003e2020 ? "Sim" : "Não", data.ingressouEntre2003e2020),
      createReq("Idade mínima", idadeMinR2, idadeAnos, cumpreIdadeR2),
      createReq("Tempo mínimo contribuição", tempoMin, tempoContribAnos, cumpreTempoContrib),
      createReq("Tempo serviço público (10a)", "10 anos", data.dezAnosServicoPublico ? "Sim" : "Não", cumpreSvcPublico),
      createReq("Tempo cargo efetivo (5a)", "05 anos", data.cincoAnosCargoEfetivo ? "Sim" : "Não", cumpreCargoEfetivo),
      createReq(meta.label, meta.pontos, pontuacaoAtual, cumprePontos)
    ]
  });

  return regras;
};
