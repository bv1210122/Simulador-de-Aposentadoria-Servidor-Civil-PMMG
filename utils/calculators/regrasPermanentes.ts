
import { FormState, RegraResultado } from '../../types';
import { formatDateBR } from '../calculoDatas';
import { createReq } from './helper';

export const avaliarRegrasPermanentes = (
  data: FormState,
  dataSimulacao: Date,
  dataCompulsoria: Date,
  idadeAnos: number,
  tempoContribAnos: number
): RegraResultado[] => {
  const isHomem = data.sexo === 'Masculino';
  const isProfessor = data.tipoServidor === 'PEBPM';
  const regras: RegraResultado[] = [];

  // Requisitos Comuns para Permanente
  const cumpre10AnosPublico = data.dezAnosServicoPublico;
  const cumpre5AnosCargo = data.cincoAnosCargoEfetivo;

  // 1. Permanente Geral
  const idadeGeral = isHomem ? 65 : 62;
  const cumpreIdadeGeral = idadeAnos >= idadeGeral;
  const cumpreContribGeral = tempoContribAnos >= 25;
  const cumpreGeral = cumpreIdadeGeral && cumpreContribGeral && cumpre10AnosPublico && cumpre5AnosCargo;

  regras.push({
    nome: "Regra Permanente (Idade)",
    descricao: "Regra definitiva pós-reforma. Exige idade mínima, tempo de contribuição e tempo de serviço público/cargo.",
    cumpre: cumpreGeral,
    requisitos: [
      createReq("Idade", idadeGeral, idadeAnos, cumpreIdadeGeral),
      createReq("Contribuição", 25, tempoContribAnos, cumpreContribGeral),
      createReq("10 Anos Svc Público", "Sim", cumpre10AnosPublico ? "Sim" : "Não", cumpre10AnosPublico),
      createReq("5 Anos Cargo Efetivo", "Sim", cumpre5AnosCargo ? "Sim" : "Não", cumpre5AnosCargo)
    ]
  });

  // 2. Permanente Professor
  if (isProfessor) {
    const idadeProf = isHomem ? 60 : 57;
    const cumpreIdadeProf = idadeAnos >= idadeProf;
    const cumpreRegencia = data.tempoRegencia >= 25;
    const cumpreProf = cumpreIdadeProf && cumpreRegencia && cumpre10AnosPublico && cumpre5AnosCargo;

    regras.push({
      nome: "Regra Permanente (Professor)",
      descricao: "Regra definitiva para PEBPM. Redução de idade em relação à geral.",
      cumpre: cumpreProf,
      requisitos: [
        createReq("Idade", idadeProf, idadeAnos, cumpreIdadeProf),
        createReq("Regência", 25, data.tempoRegencia, cumpreRegencia),
        createReq("10 Anos Svc Público", "Sim", cumpre10AnosPublico ? "Sim" : "Não", cumpre10AnosPublico),
        createReq("5 Anos Cargo Efetivo", "Sim", cumpre5AnosCargo ? "Sim" : "Não", cumpre5AnosCargo)
      ]
    });
  }

  // 3. Compulsória
  const compulsoriaAtingida = dataSimulacao.getTime() >= dataCompulsoria.getTime();
  regras.push({
    nome: "Regra Permanente - Compulsória",
    descricao: "Afastamento obrigatório por idade limite.",
    cumpre: compulsoriaAtingida,
    requisitos: [
      createReq("Idade Limite", "75 anos", idadeAnos, compulsoriaAtingida),
      createReq("Data Limite", formatDateBR(dataCompulsoria), formatDateBR(dataCompulsoria), true)
    ]
  });

  return regras;
};
