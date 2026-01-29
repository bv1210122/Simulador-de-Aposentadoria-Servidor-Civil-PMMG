import { FormState, RegraResultado } from '../../types';
import { getMetaPontosProfessor } from './pontos';
import { createReq } from './helper';

export const avaliarRegraPontosProfessor = (
  data: FormState,
  dataSimulacao: Date,
  idadeAnos: number,
  pontuacaoAtual: number
): RegraResultado[] => {
  const isProfessor = data.tipoServidor === 'PEBPM';
  const isHomem = data.sexo === 'Masculino';
  const meta = getMetaPontosProfessor(data.sexo!, dataSimulacao);

  // Se não for professor, gera as regras com a informação de bloqueio
  if (!isProfessor) {
    return [
      {
        nome: "Regra 3 - Transição - Pontos - Especial de Professor - Integral - Com paridade",
        descricao: "Exclusivo para PEBPM.",
        cumpre: false,
        requisitos: [createReq("É professor (PEBPM)", "Sim", "Não", false)]
      },
      {
        nome: "Regra 4 - Transição - Pontos - Especial de Professor - Média Integral - Sem paridade",
        descricao: "Exclusivo para PEBPM.",
        cumpre: false,
        requisitos: [createReq("É professor (PEBPM)", "Sim", "Não", false)]
      }
    ];
  }

  // Requisitos Comuns para PEBPM
  const idadeMinR3 = isHomem ? 60 : 55;
  const idadeMinR4 = isHomem ? 57 : 51;
  const regenciaMin = isHomem ? 30 : 25;

  const cumpreRegencia = data.TempoDeRegência >= regenciaMin;
  const cumpreSvcPublico = data.dezAnosServicoPublico;
  const cumpreCargoEfetivo = data.cincoAnosCargoEfetivo;
  const cumprePontos = pontuacaoAtual >= meta.pontos;

  const regras: RegraResultado[] = [];

  // REGRA 3: Professor Integral
  const cumpreIdadeR3 = idadeAnos >= idadeMinR3;
  const cumpreR3 = data.ingressouAte2003 && cumpreIdadeR3 && cumpreRegencia && cumpreSvcPublico && cumpreCargoEfetivo && cumprePontos;

  regras.push({
    nome: "Regra 3 - Transição - Pontos - Especial de Professor - Integral - Com paridade",
    descricao: "Exclusivo PEBPM. Ingresso até 31/12/2003. Regência mínima exigida.",
    cumpre: cumpreR3,
    requisitos: [
      createReq("É professor (PEBPM)", "Sim", "Sim", true),
      createReq("Ingresso até 31/12/2003", "Sim", data.ingressouAte2003 ? "Sim" : "Não", data.ingressouAte2003),
      createReq("Idade mínima", idadeMinR3, idadeAnos, cumpreIdadeR3),
      createReq("Tempo regência", regenciaMin, data.TempoDeRegência, cumpreRegencia),
      createReq("Tempo serviço público (10a)", "10 anos", data.dezAnosServicoPublico ? "Sim" : "Não", cumpreSvcPublico),
      createReq("Tempo cargo efetivo (5a)", "05 anos", data.cincoAnosCargoEfetivo ? "Sim" : "Não", cumpreCargoEfetivo),
      createReq(meta.label, meta.pontos, pontuacaoAtual, cumprePontos)
    ]
  });

  // REGRA 4: Professor Média
  const cumpreIdadeR4 = idadeAnos >= idadeMinR4;
  const cumpreR4 = data.ingressouEntre2003e2020 && cumpreIdadeR4 && cumpreRegencia && cumpreSvcPublico && cumpreCargoEfetivo && cumprePontos;

  regras.push({
    nome: "Regra 4 - Transição - Pontos - Especial de Professor - Média Integral - Sem paridade",
    descricao: "Exclusivo PEBPM. Ingresso entre 01/01/2004 e 15/09/2020.",
    cumpre: cumpreR4,
    requisitos: [
      createReq("É professor (PEBPM)", "Sim", "Sim", true),
      createReq("Ingresso após 31/12/03 e até 15/09/20", "Sim", data.ingressouEntre2003e2020 ? "Sim" : "Não", data.ingressouEntre2003e2020),
      createReq("Idade mínima", idadeMinR4, idadeAnos, cumpreIdadeR4),
      createReq("Tempo regência", regenciaMin, data.TempoDeRegência, cumpreRegencia),
      createReq("Tempo serviço público (10a)", "10 anos", data.dezAnosServicoPublico ? "Sim" : "Não", cumpreSvcPublico),
      createReq("Tempo cargo efetivo (5a)", "05 anos", data.cincoAnosCargoEfetivo ? "Sim" : "Não", cumpreCargoEfetivo),
      createReq(meta.label, meta.pontos, pontuacaoAtual, cumprePontos)
    ]
  });

  return regras;
};
