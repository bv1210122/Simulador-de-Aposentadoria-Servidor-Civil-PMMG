
import { FormState, CalculosFinais, RegraResultado } from '../types';
import { parseISO, diffInDays, calculateAgeDaysSpecific, formatDaysToYMD, addDays, formatDateBR } from './dateHelpers';

export const calculateResults = (data: FormState): { calc: CalculosFinais; regras: RegraResultado[] } => {
  const dSim = parseISO(data.dataSimulacao);
  const dNasc = parseISO(data.dataNascimento);
  const dInc = parseISO(data.dataInclusaoPMMG);
  const dCorte = new Date('2020-09-15T00:00:00');

  // 1. Cálculos Básicos
  const { totalDias: idadeDias, formatada: idadeFormatada } = calculateAgeDaysSpecific(dNasc, dSim);
  const tempoServicoPMMGDias = diffInDays(dInc, dSim);
  const totalTempoAverbado = data.averbacoes.reduce((acc, av) => acc + av.dias, 0);
  const totalTempoDescontado = data.descontos.reduce((acc, desc) => acc + desc.dias, 0);
  const tempoEfetivoCivilPMMG = tempoServicoPMMGDias - totalTempoDescontado;
  const tempoContribuicaoTotal = tempoEfetivoCivilPMMG + totalTempoAverbado;

  const isProfessor = data.tipoServidor === 'PEBPM';
  const isHomem = data.sexo === 'Masculino';
  const redutorProfAnos = isProfessor ? 5 : 0;

  // 2. Cálculos de Pedágio e Prazos
  let tempoMinimoExigidoDias = 0;
  if (isProfessor) {
    tempoMinimoExigidoDias = (isHomem ? 30 : 25) * 365;
  } else {
    tempoMinimoExigidoDias = (isHomem ? 35 : 30) * 365;
  }

  const tempoPMMG_Corte = dInc < dCorte ? diffInDays(dInc, dCorte) : 0;
  const descontosCorte = data.descontos
    .filter(d => parseISO(d.dataFinal) <= dCorte)
    .reduce((acc, d) => acc + d.dias, 0);
  
  const tempoEfetivo15092020 = Math.max(0, tempoPMMG_Corte + totalTempoAverbado - descontosCorte);
  const saldoFaltanteCorte = Math.max(0, tempoMinimoExigidoDias - tempoEfetivo15092020);
  
  // Pedágio 50% (Transição 1)
  const pedagio50 = Math.ceil(saldoFaltanteCorte * 0.5);
  const tempoACumprir50 = tempoMinimoExigidoDias + pedagio50;

  // Pedágio 100% (Transição 2)
  const pedagio100 = saldoFaltanteCorte;
  const tempoACumprir100 = tempoMinimoExigidoDias + pedagio100;

  // Data prevista baseada na regra mais comum (50%)
  const dataPrevistaAposentadoria = formatDateBR(addDays(dInc, tempoACumprir50 + totalTempoDescontado - totalTempoAverbado));

  // Pontuação
  const pontuacaoTotalDias = idadeDias + tempoContribuicaoTotal;
  const pontuacaoAnos = Math.floor(pontuacaoTotalDias / 365);
  const pontuacaoSaldoDias = pontuacaoTotalDias % 365;

  const data75Anos = formatDateBR(new Date(dNasc.getFullYear() + 75, dNasc.getMonth(), dNasc.getDate()));

  const calc: CalculosFinais = {
    idadeDias,
    idadeFormatada,
    tempoServicoPMMGDias,
    totalTempoAverbado,
    totalTempoDescontado,
    tempoEfetivoCivilPMMG,
    tempoContribuicaoTotal,
    pontuacao: pontuacaoAnos,
    pontuacaoSaldoDias,
    pedagioApurado: pedagio50,
    tempoACumprir: tempoACumprir50,
    dataPrevistaAposentadoria,
    data75Anos,
    tempoEfetivo15092020,
    tempoMinimoExigidoDias,
    saldoFaltanteCorte
  };

  const regras: RegraResultado[] = [];

  // --- REGRA 1: PONTOS ---
  const getPontosExigidos = (sexo: string, dataRef: Date) => {
    const ano = dataRef.getFullYear();
    if (sexo === 'Masculino') {
      if (ano <= 2021) return 97;
      if (ano === 2022) return 98;
      if (ano === 2023) return 99;
      if (ano === 2024) return 100;
      return 101;
    } else {
      if (ano <= 2021) return 86;
      if (ano === 2022) return 87;
      if (ano === 2023) return 88;
      if (ano === 2024) return 89;
      return 90;
    }
  };

  const pontosNecessarios = getPontosExigidos(data.sexo!, dSim) - (isProfessor ? 10 : 0);
  const idadeMinimaPontos = (isHomem ? 62 : 57) - redutorProfAnos;
  const tempoMinimoPontosAnos = (isHomem ? 35 : 30) - redutorProfAnos;

  regras.push({
    nome: "Regra 1 - Transição - Pontos - Geral",
    descricao: "Integralidade e Paridade para quem ingressou até 31/12/2003",
    cumpre: data.ingressouAte2003 && 
            (idadeDias / 365 >= idadeMinimaPontos) && 
            (tempoContribuicaoTotal / 365 >= tempoMinimoPontosAnos) && 
            data.dezAnosServicoPublico && 
            data.cincoAnosCargoEfetivo && 
            calc.pontuacao >= pontosNecessarios,
    requisitos: [
      { label: "Ingresso até 31/12/2003", esperado: "Sim", atual: data.ingressouAte2003 ? "Sim" : "Não", cumpre: data.ingressouAte2003 },
      { label: "Idade Mínima", esperado: `${idadeMinimaPontos} anos`, atual: `${Math.floor(idadeDias/365)} anos`, cumpre: (idadeDias/365) >= idadeMinimaPontos },
      { label: "Tempo Contribuição", esperado: `${tempoMinimoPontosAnos} anos`, atual: `${Math.floor(tempoContribuicaoTotal/365)} anos`, cumpre: (tempoContribuicaoTotal/365) >= tempoMinimoPontosAnos },
      { label: "Pontos na Data", esperado: `${pontosNecessarios} pontos`, atual: `${calc.pontuacao} pontos`, cumpre: calc.pontuacao >= pontosNecessarios },
      { label: "10 anos Serviço Público", esperado: "Sim", atual: data.dezAnosServicoPublico ? "Sim" : "Não", cumpre: data.dezAnosServicoPublico },
      { label: "05 anos Cargo Efetivo", esperado: "Sim", atual: data.cincoAnosCargoEfetivo ? "Sim" : "Não", cumpre: data.cincoAnosCargoEfetivo }
    ]
  });

  // --- REGRA 2: PEDÁGIO 50% ---
  const idadeMinimaPedagio50 = (isHomem ? 60 : 55) - redutorProfAnos;
  regras.push({
    nome: "Regra 2 - Transição - Pedágio - 50%",
    descricao: "Cumprimento de 50% do tempo que faltava em 15/09/2020",
    cumpre: data.ingressouAte2003 && 
            (idadeDias / 365 >= idadeMinimaPedagio50) && 
            (tempoContribuicaoTotal >= tempoACumprir50) && 
            data.dezAnosServicoPublico && 
            data.cincoAnosCargoEfetivo,
    requisitos: [
      { label: "Ingresso até 31/12/2003", esperado: "Sim", atual: data.ingressouAte2003 ? "Sim" : "Não", cumpre: data.ingressouAte2003 },
      { label: "Idade Mínima", esperado: `${idadeMinimaPedagio50} anos`, atual: `${Math.floor(idadeDias/365)} anos`, cumpre: (idadeDias/365) >= idadeMinimaPedagio50 },
      { label: "Tempo + Pedágio (50%)", esperado: `${formatDaysToYMD(tempoACumprir50)}`, atual: `${formatDaysToYMD(tempoContribuicaoTotal)}`, cumpre: tempoContribuicaoTotal >= tempoACumprir50 },
      { label: "10 anos Serviço Público", esperado: "Sim", atual: data.dezAnosServicoPublico ? "Sim" : "Não", cumpre: data.dezAnosServicoPublico },
      { label: "05 anos Cargo Efetivo", esperado: "Sim", atual: data.cincoAnosCargoEfetivo ? "Sim" : "Não", cumpre: data.cincoAnosCargoEfetivo }
    ]
  });

  // --- REGRA 3: PEDÁGIO 100% ---
  const idadeMinimaPedagio100 = (isHomem ? 60 : 57) - redutorProfAnos;
  regras.push({
    nome: "Regra 3 - Transição - Pedágio - 100%",
    descricao: "Cumprimento de 100% do tempo que faltava em 15/09/2020",
    cumpre: (idadeDias / 365 >= idadeMinimaPedagio100) && 
            (tempoContribuicaoTotal >= tempoACumprir100) && 
            data.dezAnosServicoPublico && 
            data.cincoAnosCargoEfetivo,
    requisitos: [
      { label: "Idade Mínima", esperado: `${idadeMinimaPedagio100} anos`, atual: `${Math.floor(idadeDias/365)} anos`, cumpre: (idadeDias/365) >= idadeMinimaPedagio100 },
      { label: "Tempo + Pedágio (100%)", esperado: `${formatDaysToYMD(tempoACumprir100)}`, atual: `${formatDaysToYMD(tempoContribuicaoTotal)}`, cumpre: tempoContribuicaoTotal >= tempoACumprir100 },
      { label: "10 anos Serviço Público", esperado: "Sim", atual: data.dezAnosServicoPublico ? "Sim" : "Não", cumpre: data.dezAnosServicoPublico },
      { label: "05 anos Cargo Efetivo", esperado: "Sim", atual: data.cincoAnosCargoEfetivo ? "Sim" : "Não", cumpre: data.cincoAnosCargoEfetivo }
    ]
  });

  // --- REGRA PERMANENTE ---
  const idadePermanente = (isHomem ? 65 : 62) - redutorProfAnos;
  const tempoPermanenteDias = 25 * 365;
  regras.push({
    nome: "Regra Permanente (Pós-Reforma)",
    descricao: "Nova regra geral para quem ingressou após a reforma ou não atingiu as transições",
    cumpre: (idadeDias / 365 >= idadePermanente) && 
            (tempoContribuicaoTotal >= tempoPermanenteDias) && 
            data.dezAnosServicoPublico && 
            data.cincoAnosCargoEfetivo,
    requisitos: [
      { label: "Idade Mínima", esperado: `${idadePermanente} anos`, atual: `${Math.floor(idadeDias/365)} anos`, cumpre: (idadeDias/365) >= idadePermanente },
      { label: "Tempo Contribuição", esperado: "25 anos", atual: `${Math.floor(tempoContribuicaoTotal/365)} anos`, cumpre: tempoContribuicaoTotal >= tempoPermanenteDias },
      { label: "10 anos Serviço Público", esperado: "Sim", atual: data.dezAnosServicoPublico ? "Sim" : "Não", cumpre: data.dezAnosServicoPublico },
      { label: "05 anos Cargo Efetivo", esperado: "Sim", atual: data.cincoAnosCargoEfetivo ? "Sim" : "Não", cumpre: data.cincoAnosCargoEfetivo }
    ]
  });

  return { calc,  regras };
};
