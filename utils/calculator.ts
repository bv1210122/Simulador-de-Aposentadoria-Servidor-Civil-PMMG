
import { FormState, CalculosFinais, RegraResultado } from '../types';
import { parseISO, diffInDays, calculateAgeDaysSpecific, formatDaysToYMD, addDays, formatDateBR } from './dateHelpers';

const getPontosGeral = (sexo: string, dataSim: Date): number => {
  const tempo = dataSim.getTime();
  if (sexo === 'Masculino') {
    if (tempo < parseISO('2022-04-01').getTime()) return 97;
    if (tempo < parseISO('2023-07-01').getTime()) return 98;
    if (tempo < parseISO('2024-10-01').getTime()) return 99;
    if (tempo < parseISO('2026-01-01').getTime()) return 100;
    if (tempo < parseISO('2027-04-01').getTime()) return 101;
    if (tempo < parseISO('2028-07-01').getTime()) return 102;
    if (tempo < parseISO('2029-10-01').getTime()) return 103;
    if (tempo < parseISO('2031-01-01').getTime()) return 104;
    return 105;
  } else {
    if (tempo < parseISO('2022-04-01').getTime()) return 86;
    if (tempo < parseISO('2023-07-01').getTime()) return 87;
    if (tempo < parseISO('2024-10-01').getTime()) return 88;
    if (tempo < parseISO('2026-01-01').getTime()) return 89;
    if (tempo < parseISO('2027-04-01').getTime()) return 90;
    if (tempo < parseISO('2028-07-01').getTime()) return 91;
    if (tempo < parseISO('2029-10-01').getTime()) return 92;
    if (tempo < parseISO('2031-01-01').getTime()) return 93;
    if (tempo < parseISO('2032-04-01').getTime()) return 94;
    if (tempo < parseISO('2033-07-01').getTime()) return 95;
    if (tempo < parseISO('2034-10-01').getTime()) return 96;
    if (tempo < parseISO('2036-01-01').getTime()) return 97;
    if (tempo < parseISO('2037-04-01').getTime()) return 98;
    if (tempo < parseISO('2038-07-01').getTime()) return 99;
    return 100;
  }
};

const getPontosProfessor = (sexo: string, dataSim: Date): number => {
  const tempo = dataSim.getTime();
  if (sexo === 'Masculino') {
    if (tempo < parseISO('2022-01-01').getTime()) return 92;
    if (tempo < parseISO('2023-01-01').getTime()) return 93;
    if (tempo < parseISO('2024-01-01').getTime()) return 94;
    if (tempo < parseISO('2025-01-01').getTime()) return 95;
    if (tempo < parseISO('2026-01-01').getTime()) return 96;
    if (tempo < parseISO('2027-01-01').getTime()) return 97;
    if (tempo < parseISO('2028-01-01').getTime()) return 98;
    if (tempo < parseISO('2029-01-01').getTime()) return 99;
    return 100;
  } else {
    if (tempo < parseISO('2022-01-01').getTime()) return 81;
    if (tempo < parseISO('2023-01-01').getTime()) return 82;
    if (tempo < parseISO('2024-01-01').getTime()) return 83;
    if (tempo < parseISO('2025-01-01').getTime()) return 84;
    if (tempo < parseISO('2026-01-01').getTime()) return 85;
    if (tempo < parseISO('2027-01-01').getTime()) return 86;
    if (tempo < parseISO('2028-01-01').getTime()) return 87;
    if (tempo < parseISO('2029-01-01').getTime()) return 88;
    if (tempo < parseISO('2030-01-01').getTime()) return 89;
    if (tempo < parseISO('2031-01-01').getTime()) return 90;
    if (tempo < parseISO('2032-01-01').getTime()) return 91;
    return 92;
  }
};

export const calculateResults = (data: FormState): { calc: CalculosFinais; regras: RegraResultado[] } => {
  const dSim = parseISO(data.dataSimulacao);
  const dNasc = parseISO(data.dataNascimento);
  const dInc = parseISO(data.dataInclusaoPMMG);
  const dCorte = new Date('2020-09-15T00:00:00');

  const tempoServicoPMMGDias = diffInDays(dInc, dSim);
  const { totalDias: idadeDias, formatada: idadeFormatada } = calculateAgeDaysSpecific(dNasc, dSim);
  const totalTempoAverbado = data.averbacoes.reduce((acc, av) => acc + av.dias, 0);
  const totalTempoDescontado = data.descontos.reduce((acc, desc) => acc + desc.dias, 0);
  
  const tempoContribuicaoTotal = tempoServicoPMMGDias + totalTempoAverbado - totalTempoDescontado;
  const pontuacaoTotalDias = idadeDias + tempoContribuicaoTotal;
  const pontuacaoInteira = Math.floor(pontuacaoTotalDias / 365);

  const isProfessor = data.tipoServidor === 'PEBPM';
  const isHomem = data.sexo === 'Masculino';

  // Cálculo de Pedágio conforme Art. 134-A/B
  const tempoPMMG_Corte = dInc <= dCorte ? diffInDays(dInc, dCorte) : 0;
  // Simplificação para averbações/descontos no corte (ver calculator anterior para refinamento se necessário)
  const tempoEfetivo15092020 = tempoPMMG_Corte; 
  const metaCorte = (isProfessor ? (isHomem ? 30 : 25) : (isHomem ? 35 : 30)) * 365;
  const saldoFaltanteCorte = Math.max(0, metaCorte - tempoEfetivo15092020);
  const pedagioCalculado = Math.ceil(saldoFaltanteCorte * 0.5);

  const calc: CalculosFinais = {
    idadeDias, idadeFormatada, tempoServicoPMMGDias, totalTempoAverbado, totalTempoDescontado,
    tempoEfetivoCivilPMMG: tempoServicoPMMGDias, tempoContribuicaoTotal,
    pontuacao: pontuacaoInteira, pontuacaoSaldoDias: pontuacaoTotalDias % 365,
    pedagioApurado: pedagioCalculado,
    tempoACumprir: metaCorte + pedagioCalculado,
    dataPrevistaAposentadoria: formatDateBR(addDays(dSim, Math.max(0, (metaCorte + pedagioCalculado) - tempoContribuicaoTotal))),
    data75Anos: formatDateBR(new Date(dNasc.getFullYear() + 75, dNasc.getMonth(), dNasc.getDate())),
    tempoEfetivo15092020, tempoMinimoExigidoDias: metaCorte, saldoFaltanteCorte
  };

  const regras: RegraResultado[] = [];

  // --- REGRAS DE PONTOS ---
  const pontosGeral = getPontosGeral(data.sexo!, dSim);
  
  // Regra 1: Pontos Geral - Integral
  regras.push({
    nome: "Regra 1 - Transição - Pontos - Geral - Integral",
    descricao: "Ingresso até 2003, idade mínima elevada e paridade.",
    cumpre: data.ingressouAte2003 && (idadeDias/365 >= (isHomem ? 65 : 60)) && (tempoContribuicaoTotal/365 >= (isHomem ? 35 : 30)) && data.dezAnosServicoPublico && data.cincoAnosCargoEfetivo && pontuacaoInteira >= pontosGeral,
    requisitos: [
      { label: "Ingresso até 31/12/2003", esperado: "Sim", atual: data.ingressouAte2003 ? "Sim" : "Não", cumpre: data.ingressouAte2003 },
      { label: "Idade Mínima", esperado: isHomem ? "65 anos" : "60 anos", atual: `${Math.floor(idadeDias/365)} anos`, cumpre: (idadeDias/365) >= (isHomem ? 65 : 60) },
      { label: "Tempo Contribuição", esperado: isHomem ? "35 anos" : "30 anos", atual: `${Math.floor(tempoContribuicaoTotal/365)} anos`, cumpre: (tempoContribuicaoTotal/365) >= (isHomem ? 35 : 30) },
      { label: "Pontos Exigidos", esperado: `${pontosGeral} pts`, atual: `${pontuacaoInteira} pts`, cumpre: pontuacaoInteira >= pontosGeral }
    ]
  });

  // Regra 2: Pontos Geral - Média
  regras.push({
    nome: "Regra 2 - Transição - Pontos - Geral - Média",
    descricao: "Ingresso entre 2003 e 2020, sem paridade.",
    cumpre: data.ingressouEntre2003e2020 && (idadeDias/365 >= (isHomem ? 62 : 56)) && (tempoContribuicaoTotal/365 >= (isHomem ? 35 : 30)) && data.dezAnosServicoPublico && data.cincoAnosCargoEfetivo && pontuacaoInteira >= pontosGeral,
    requisitos: [
      { label: "Ingresso 2003-2020", esperado: "Sim", atual: data.ingressouEntre2003e2020 ? "Sim" : "Não", cumpre: data.ingressouEntre2003e2020 },
      { label: "Idade Mínima", esperado: isHomem ? "62 anos" : "56 anos", atual: `${Math.floor(idadeDias/365)} anos`, cumpre: (idadeDias/365) >= (isHomem ? 62 : 56) },
      { label: "Pontos Exigidos", esperado: `${pontosGeral} pts`, atual: `${pontuacaoInteira} pts`, cumpre: pontuacaoInteira >= pontosGeral }
    ]
  });

  // Regras 3 e 4: Professores
  const pontosProf = getPontosProfessor(data.sexo!, dSim);
  if (isProfessor) {
    regras.push({
      nome: "Regra 3 - Transição - Pontos - Professor - Integral",
      descricao: "Apenas PEBPM, ingresso até 2003.",
      cumpre: data.ingressouAte2003 && (idadeDias/365 >= (isHomem ? 60 : 55)) && (data.tempoRegencia >= (isHomem ? 30 : 25)) && pontuacaoInteira >= pontosProf,
      requisitos: [
        { label: "Idade Mínima", esperado: isHomem ? "60 anos" : "55 anos", atual: `${Math.floor(idadeDias/365)} anos`, cumpre: (idadeDias/365) >= (isHomem ? 60 : 55) },
        { label: "Tempo Regência", esperado: isHomem ? "30 anos" : "25 anos", atual: `${data.tempoRegencia} anos`, cumpre: data.tempoRegencia >= (isHomem ? 30 : 25) },
        { label: "Pontos Exigidos", esperado: `${pontosProf} pts`, atual: `${pontuacaoInteira} pts`, cumpre: pontuacaoInteira >= pontosProf }
      ]
    });
    regras.push({
      nome: "Regra 4 - Transição - Pontos - Professor - Média",
      descricao: "Apenas PEBPM, ingresso 2003-2020.",
      cumpre: data.ingressouEntre2003e2020 && (idadeDias/365 >= (isHomem ? 57 : 51)) && (data.tempoRegencia >= (isHomem ? 30 : 25)) && pontuacaoInteira >= pontosProf,
      requisitos: [
        { label: "Idade Mínima", esperado: isHomem ? "57 anos" : "51 anos", atual: `${Math.floor(idadeDias/365)} anos`, cumpre: (idadeDias/365) >= (isHomem ? 57 : 51) },
        { label: "Pontos Exigidos", esperado: `${pontosProf} pts`, atual: `${pontuacaoInteira} pts`, cumpre: pontuacaoInteira >= pontosProf }
      ]
    });
  }

  // --- REGRAS DE PEDÁGIO ---
  regras.push({
    nome: "Regra 1 - Transição - Pedágio - Geral - Integral",
    descricao: "Ingresso até 2003, idade mínima e cumprimento de pedágio.",
    cumpre: data.ingressouAte2003 && (idadeDias/365 >= (isHomem ? 60 : 55)) && (tempoContribuicaoTotal >= calc.tempoACumprir),
    requisitos: [
      { label: "Idade Mínima", esperado: isHomem ? "60 anos" : "55 anos", atual: `${Math.floor(idadeDias/365)} anos`, cumpre: (idadeDias/365) >= (isHomem ? 60 : 55) },
      { label: "Tempo + Pedágio", esperado: `${calc.tempoACumprir} dias`, atual: `${tempoContribuicaoTotal} dias`, cumpre: tempoContribuicaoTotal >= calc.tempoACumprir }
    ]
  });

  // --- REGRAS PERMANENTES ---
  regras.push({
    nome: "Regra Permanente 1 - Geral",
    descricao: "Idade 65/62 e 25 anos de contribuição.",
    cumpre: (idadeDias/365 >= (isHomem ? 65 : 62)) && (tempoContribuicaoTotal/365 >= 25) && data.dezAnosServicoPublico && data.cincoAnosCargoEfetivo,
    requisitos: [
      { label: "Idade Mínima", esperado: isHomem ? "65 anos" : "62 anos", atual: `${Math.floor(idadeDias/365)} anos`, cumpre: (idadeDias/365) >= (isHomem ? 65 : 62) },
      { label: "Tempo Mínimo", esperado: "25 anos", atual: `${Math.floor(tempoContribuicaoTotal/365)} anos`, cumpre: (tempoContribuicaoTotal/365) >= 25 }
    ]
  });

  return { calc, regras };
};
