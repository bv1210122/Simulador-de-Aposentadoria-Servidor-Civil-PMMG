
import { FormState, CalculosFinais, RegraResultado } from '../types';
import { parseISO, diffInDays, calculateAgeDaysSpecific, formatDaysToYMD, addDays, formatDateBR } from './dateHelpers';

const getPontosRegraGeral = (sexo: string, dataSim: Date): { pontos: number; label: string } => {
  const t = dataSim.getTime();
  if (sexo === 'Masculino') {
    if (t < parseISO('2022-04-01').getTime()) return { pontos: 97, label: "97 pontos (até 31/03/2022)" };
    if (t < parseISO('2023-07-01').getTime()) return { pontos: 98, label: "98 pontos (a contar de 01/04/2022)" };
    if (t < parseISO('2024-10-01').getTime()) return { pontos: 99, label: "99 pontos (a contar de 01/07/2023)" };
    if (t < parseISO('2026-01-01').getTime()) return { pontos: 100, label: "100 pontos (a contar de 01/10/2024)" };
    if (t < parseISO('2027-04-01').getTime()) return { pontos: 101, label: "101 pontos (a contar de 01/01/2026)" };
    if (t < parseISO('2028-07-01').getTime()) return { pontos: 102, label: "102 pontos (a contar de 01/04/2027)" };
    if (t < parseISO('2029-10-01').getTime()) return { pontos: 103, label: "103 pontos (a contar de 01/07/2028)" };
    if (t < parseISO('2031-01-01').getTime()) return { pontos: 104, label: "104 pontos (a contar de 01/10/2029)" };
    return { pontos: 105, label: "105 pontos (a contar de 01/01/2031)" };
  } else {
    if (t < parseISO('2022-04-01').getTime()) return { pontos: 86, label: "86 pontos (até 31/03/2022)" };
    if (t < parseISO('2023-07-01').getTime()) return { pontos: 87, label: "87 pontos (a contar de 01/04/2022)" };
    if (t < parseISO('2024-10-01').getTime()) return { pontos: 88, label: "88 pontos (a contar de 01/07/2023)" };
    if (t < parseISO('2026-01-01').getTime()) return { pontos: 89, label: "89 pontos (a contar de 01/10/2024)" };
    if (t < parseISO('2027-04-01').getTime()) return { pontos: 90, label: "90 pontos (a contar de 01/01/2026)" };
    if (t < parseISO('2028-07-01').getTime()) return { pontos: 91, label: "91 pontos (a contar de 01/04/2027)" };
    if (t < parseISO('2029-10-01').getTime()) return { pontos: 92, label: "92 pontos (a contar de 01/07/2028)" };
    if (t < parseISO('2031-01-01').getTime()) return { pontos: 93, label: "93 pontos (a contar de 01/10/2029)" };
    if (t < parseISO('2032-04-01').getTime()) return { pontos: 94, label: "94 pontos (a contar de 01/01/2031)" };
    if (t < parseISO('2033-07-01').getTime()) return { pontos: 95, label: "95 pontos (a contar de 01/04/2032)" };
    if (t < parseISO('2034-10-01').getTime()) return { pontos: 96, label: "96 pontos (a contar de 01/07/2033)" };
    if (t < parseISO('2036-01-01').getTime()) return { pontos: 97, label: "97 pontos (a contar de 01/10/2034)" };
    if (t < parseISO('2037-04-01').getTime()) return { pontos: 98, label: "98 pontos (a contar de 01/01/2036)" };
    if (t < parseISO('2038-07-01').getTime()) return { pontos: 99, label: "99 pontos (a contar de 01/04/2037)" };
    return { pontos: 100, label: "100 pontos (a contar de 01/07/2038)" };
  }
};

const getPontosProfessor = (sexo: string, dataSim: Date): { pontos: number; label: string } => {
  const t = dataSim.getTime();
  if (sexo === 'Masculino') {
    if (t < parseISO('2022-01-01').getTime()) return { pontos: 92, label: "92 pontos (até 31/12/2021)" };
    if (t < parseISO('2023-01-01').getTime()) return { pontos: 93, label: "93 pontos (a contar de 01/01/2022)" };
    if (t < parseISO('2024-01-01').getTime()) return { pontos: 94, label: "94 pontos (a contar de 01/01/2023)" };
    if (t < parseISO('2025-01-01').getTime()) return { pontos: 95, label: "95 pontos (a contar de 01/01/2024)" };
    if (t < parseISO('2026-01-01').getTime()) return { pontos: 96, label: "96 pontos (a contar de 01/01/2025)" };
    if (t < parseISO('2027-01-01').getTime()) return { pontos: 97, label: "97 pontos (a contar de 01/01/2026)" };
    if (t < parseISO('2028-01-01').getTime()) return { pontos: 98, label: "98 pontos (a contar de 01/01/2027)" };
    if (t < parseISO('2029-01-01').getTime()) return { pontos: 99, label: "99 pontos (a contar de 01/01/2028)" };
    return { pontos: 100, label: "100 pontos (a contar de 01/01/2029)" };
  } else {
    if (t < parseISO('2022-01-01').getTime()) return { pontos: 81, label: "81 pontos (até 31/12/2021)" };
    if (t < parseISO('2023-01-01').getTime()) return { pontos: 82, label: "82 pontos (a contar de 01/01/2022)" };
    if (t < parseISO('2024-01-01').getTime()) return { pontos: 83, label: "83 pontos (a contar de 01/01/2023)" };
    if (t < parseISO('2025-01-01').getTime()) return { pontos: 84, label: "84 pontos (a contar de 01/01/2024)" };
    if (t < parseISO('2026-01-01').getTime()) return { pontos: 85, label: "85 pontos (a contar de 01/01/2025)" };
    if (t < parseISO('2027-01-01').getTime()) return { pontos: 86, label: "86 pontos (a contar de 01/01/2026)" };
    if (t < parseISO('2028-01-01').getTime()) return { pontos: 87, label: "87 pontos (a contar de 01/01/2027)" };
    if (t < parseISO('2029-01-01').getTime()) return { pontos: 88, label: "88 pontos (a contar de 01/01/2028)" };
    if (t < parseISO('2030-01-01').getTime()) return { pontos: 89, label: "89 pontos (a contar de 01/01/2029)" };
    if (t < parseISO('2031-01-01').getTime()) return { pontos: 90, label: "90 pontos (a contar de 01/01/2030)" };
    if (t < parseISO('2032-01-01').getTime()) return { pontos: 91, label: "91 pontos (a contar de 01/01/2031)" };
    return { pontos: 92, label: "92 pontos (a contar de 01/01/2032)" };
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

  const tempoPMMG_Corte = dInc <= dCorte ? diffInDays(dInc, dCorte) : 0;
  const metaTempoGeral = (isProfessor ? (isHomem ? 30 : 25) : (isHomem ? 35 : 30)) * 365;
  const saldoFaltanteCorte = Math.max(0, metaTempoGeral - tempoPMMG_Corte);
  const pedagioCalculado = Math.ceil(saldoFaltanteCorte * 0.5);

  const calc: CalculosFinais = {
    idadeDias, idadeFormatada, tempoServicoPMMGDias, totalTempoAverbado, totalTempoDescontado,
    tempoEfetivoCivilPMMG: tempoServicoPMMGDias, tempoContribuicaoTotal,
    pontuacao: pontuacaoInteira, pontuacaoSaldoDias: pontuacaoTotalDias % 365,
    pedagioApurado: pedagioCalculado,
    tempoACumprir: metaTempoGeral + pedagioCalculado,
    dataPrevistaAposentadoria: formatDateBR(addDays(dSim, Math.max(0, (metaTempoGeral + pedagioCalculado) - tempoContribuicaoTotal))),
    data75Anos: formatDateBR(new Date(dNasc.getFullYear() + 75, dNasc.getMonth(), dNasc.getDate())),
    tempoEfetivo15092020: tempoPMMG_Corte, 
    tempoMinimoExigidoDias: metaTempoGeral, 
    saldoFaltanteCorte
  };

  const regras: RegraResultado[] = [];

  // --- REGRAS DE PONTOS (MANTIDAS) ---
  const pGeral = getPontosRegraGeral(data.sexo!, dSim);
  const pProf = getPontosProfessor(data.sexo!, dSim);

  // --- REGRAS DE PEDÁGIO (MANTIDAS) ---

  // --- REGRAS PERMANENTES (NOVO) ---

  // REGRA PERMANENTE 1 - GERAL
  const idadePermGeral = isHomem ? 65 : 62;
  regras.push({
    nome: "Regra Permanente 1 - Regra permanente geral - Média permanente - Sem paridade",
    descricao: "Regra padrão pós-reforma. Baseada na idade limite de 65/62 anos e 25 anos de contribuição.",
    cumpre: (idadeDias/365 >= idadePermGeral) && (tempoContribuicaoTotal/365 >= 25) && data.dezAnosServicoPublico && data.cincoAnosCargoEfetivo,
    requisitos: [
      { label: "Idade Mínima", esperado: `${idadePermGeral} anos`, atual: `${Math.floor(idadeDias/365)} anos`, cumpre: (idadeDias/365) >= idadePermGeral },
      { label: "Contribuição Mínima", esperado: "25 anos", atual: `${Math.floor(tempoContribuicaoTotal/365)} anos`, cumpre: (tempoContribuicaoTotal/365) >= 25 },
      { label: "Serviço Público (10a)", esperado: "Sim", atual: data.dezAnosServicoPublico ? "Sim" : "Não", cumpre: data.dezAnosServicoPublico },
      { label: "Cargo Efetivo (05a)", esperado: "Sim", atual: data.cincoAnosCargoEfetivo ? "Sim" : "Não", cumpre: data.cincoAnosCargoEfetivo }
    ]
  });

  // REGRA PERMANENTE 2 - ESPECIAL PROFESSOR
  const idadePermProf = isHomem ? 60 : 57;
  const reqPerm2 = [{ label: "É professor (PEBPM)", esperado: "Sim", atual: isProfessor ? "Sim" : "Não", cumpre: isProfessor }];
  if (isProfessor) {
    reqPerm2.push(
      { label: "Idade Mínima", esperado: `${idadePermProf} anos`, atual: `${Math.floor(idadeDias/365)} anos`, cumpre: (idadeDias/365) >= idadePermProf },
      { label: "Regência Efetiva", esperado: "25 anos", atual: `${data.tempoRegencia} anos`, cumpre: data.tempoRegencia >= 25 },
      { label: "Serviço Público (10a)", esperado: "Sim", atual: data.dezAnosServicoPublico ? "Sim" : "Não", cumpre: data.dezAnosServicoPublico },
      { label: "Cargo Efetivo (05a)", esperado: "Sim", atual: data.cincoAnosCargoEfetivo ? "Sim" : "Não", cumpre: data.cincoAnosCargoEfetivo }
    );
  } else {
    reqPerm2.push({ label: "Aviso", esperado: "Somente Professores", atual: "Regra não aplicável", cumpre: false });
  }

  regras.push({
    nome: "Regra Permanente 2 - Regra permanente especial de professor - Média permanente - Sem paridade",
    descricao: "Redução de 5 anos nos critérios de idade para professores em efetivo exercício na regência.",
    cumpre: isProfessor && (idadeDias/365 >= idadePermProf) && (data.tempoRegencia >= 25) && data.dezAnosServicoPublico && data.cincoAnosCargoEfetivo,
    requisitos: reqPerm2
  });

  // REGRA PERMANENTE 3 - COMPULSÓRIA
  const data75 = new Date(dNasc.getFullYear() + 75, dNasc.getMonth(), dNasc.getDate());
  const jaFez75 = dSim.getTime() >= data75.getTime();
  regras.push({
    nome: "Regra Permanente 3 - Compulsória - Média proporcional - Sem paridade",
    descricao: "Afastamento obrigatório aos 75 anos de idade.",
    cumpre: jaFez75,
    requisitos: [
      { 
        label: "Idade Obrigatória", 
        esperado: "75 anos", 
        atual: `${Math.floor(idadeDias/365)} anos`, 
        cumpre: jaFez75 
      },
      {
        label: "Data Limite",
        esperado: formatDateBR(data75),
        atual: jaFez75 ? "Atingida" : "A vencer",
        cumpre: jaFez75
      },
      {
        label: "Informação",
        esperado: "Afastamento Obrigatório",
        atual: jaFez75 ? "Imediato" : "Futuro",
        cumpre: true
      }
    ]
  });

  // --- REGRAS DE PONTOS E PEDÁGIO MANTIDAS (ADICIONAR SE NECESSÁRIO NO FLUXO COMPLETO) ---
  
  // REGRA 1 - PEDÁGIO GERAL INTEGRAL
  regras.push({
    nome: "Regra 1 - Transição - Pedágio - Geral - Integral - Com paridade",
    descricao: "Exige ingresso até 31/12/2003, idade 60/55 e tempo 35/30.",
    cumpre: data.ingressouAte2003 && (idadeDias/365 >= (isHomem ? 60 : 55)) && (tempoContribuicaoTotal/365 >= (isHomem ? 35 : 30)) && data.dezAnosServicoPublico && data.cincoAnosCargoEfetivo && (tempoContribuicaoTotal >= metaTempoGeral + saldoFaltanteCorte),
    requisitos: [
      { label: "Ingresso até 31/12/2003", esperado: "Sim", atual: data.ingressouAte2003 ? "Sim" : "Não", cumpre: data.ingressouAte2003 },
      { label: "Idade Mínima", esperado: isHomem ? "60 anos" : "55 anos", atual: `${Math.floor(idadeDias/365)} anos`, cumpre: (idadeDias/365) >= (isHomem ? 60 : 55) },
      { label: "Tempo Mínimo Contribuição", esperado: isHomem ? "35 anos" : "30 anos", atual: `${Math.floor(tempoContribuicaoTotal/365)} anos`, cumpre: (tempoContribuicaoTotal/365) >= (isHomem ? 35 : 30) },
      { label: "Pedágio (100%)", esperado: `${saldoFaltanteCorte} dias`, atual: `${Math.min(tempoContribuicaoTotal - metaTempoGeral, saldoFaltanteCorte)} dias`, cumpre: (tempoContribuicaoTotal >= metaTempoGeral + saldoFaltanteCorte) }
    ]
  });

  return { calc, regras };
};
