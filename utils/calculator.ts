
import { FormState, CalculosFinais, RegraResultado } from '../types';
import { parseISO, diffInDays, calculateAgeDaysSpecific, addDays, formatDateBR } from './dateHelpers';

/**
 * Tabelas de Pontuação Progressiva
 */
const getPontosGeral = (sexo: string, dataSim: Date): { pontos: number; label: string } => {
  const t = dataSim.getTime();
  if (sexo === 'Masculino') {
    if (t < parseISO('2022-04-01').getTime()) return { pontos: 97, label: "97 pts (até 31/03/22)" };
    if (t < parseISO('2023-07-01').getTime()) return { pontos: 98, label: "98 pts (a partir de 01/04/22)" };
    if (t < parseISO('2024-10-01').getTime()) return { pontos: 99, label: "99 pts (a partir de 01/07/23)" };
    return { pontos: 100, label: "100 pts (a partir de 01/10/24)" };
  } else {
    if (t < parseISO('2022-04-01').getTime()) return { pontos: 86, label: "86 pts (até 31/03/22)" };
    if (t < parseISO('2023-07-01').getTime()) return { pontos: 87, label: "87 pts (a partir de 01/04/22)" };
    if (t < parseISO('2024-10-01').getTime()) return { pontos: 88, label: "88 pts (a partir de 01/07/23)" };
    return { pontos: 89, label: "89 pts (a partir de 01/10/24)" };
  }
};

const getPontosProfessor = (sexo: string, dataSim: Date): { pontos: number; label: string } => {
  const t = dataSim.getTime();
  const anos = [2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030, 2031, 2032];
  const ptsM = [92, 93, 94, 95, 96, 97, 98, 99, 100, 100, 100, 100];
  const ptsF = [81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92];

  const currentYear = dataSim.getFullYear();
  const idx = Math.max(0, currentYear - 2021);
  
  if (sexo === 'Masculino') {
    const val = ptsM[Math.min(idx, 8)];
    return { pontos: val, label: `${val} pontos (em ${currentYear})` };
  } else {
    const val = ptsF[Math.min(idx, 11)];
    return { pontos: val, label: `${val} pontos (em ${currentYear})` };
  }
};

export const calculateResults = (data: FormState): { calc: CalculosFinais; regras: RegraResultado[] } => {
  const dSim = parseISO(data.dataSimulacao);
  const dNasc = parseISO(data.dataNascimento);
  const dInc = parseISO(data.dataInclusaoPMMG);
  const dCorte = new Date('2020-09-15T00:00:00');

  const isProfessor = data.tipoServidor === 'PEBPM';
  const isHomem = data.sexo === 'Masculino';

  const { totalDias: idadeDias, formatada: idadeFormatada } = calculateAgeDaysSpecific(dNasc, dSim);
  const tempoServicoPMMGDias = diffInDays(dInc, dSim);
  const totalTempoAverbado = data.averbacoes.reduce((acc, av) => acc + av.dias, 0);
  const totalTempoDescontado = data.descontos.reduce((acc, desc) => acc + desc.dias, 0);
  const tempoContribuicaoTotal = tempoServicoPMMGDias + totalTempoAverbado - totalTempoDescontado;
  
  const pontuacaoTotalDias = idadeDias + tempoContribuicaoTotal;
  const pontuacaoInteira = Math.floor(pontuacaoTotalDias / 365);

  // Cálculo de Pedágio 50% (EC 104/2020)
  const tempoPMMG_Corte = dInc <= dCorte ? diffInDays(dInc, dCorte) : 0;
  const metaTempoGeral = (isProfessor ? (isHomem ? 30 : 25) : (isHomem ? 35 : 30)) * 365;
  const saldoFaltanteCorte = Math.max(0, metaTempoGeral - tempoPMMG_Corte);
  const pedagio50 = Math.ceil(saldoFaltanteCorte * 0.5);

  const calc: CalculosFinais = {
    idadeDias, idadeFormatada, tempoServicoPMMGDias, totalTempoAverbado, totalTempoDescontado,
    tempoEfetivoCivilPMMG: tempoServicoPMMGDias, tempoContribuicaoTotal,
    pontuacao: pontuacaoInteira, pontuacaoSaldoDias: pontuacaoTotalDias % 365,
    pedagioApurado: pedagio50,
    tempoACumprir: metaTempoGeral + pedagio50,
    dataPrevistaAposentadoria: formatDateBR(addDays(dSim, Math.max(0, (metaTempoGeral + pedagio50) - tempoContribuicaoTotal))),
    data75Anos: formatDateBR(new Date(dNasc.getFullYear() + 75, dNasc.getMonth(), dNasc.getDate())),
    tempoEfetivo15092020: tempoPMMG_Corte,
    tempoMinimoExigidoDias: metaTempoGeral,
    saldoFaltanteCorte
  };

  const regras: RegraResultado[] = [];

  // --- REGRAS DE PONTOS ---
  const ptG = getPontosGeral(data.sexo!, dSim);
  const ptP = getPontosProfessor(data.sexo!, dSim);

  regras.push({
    nome: "Regra 1/2 - Transição - Pontos - Geral",
    descricao: "Ingresso até 2020. Pontuação progressiva idade + tempo.",
    cumpre: (data.ingressouAte2003 || data.ingressouEntre2003e2020) && (idadeDias/365 >= (isHomem ? 62 : 56)) && (tempoContribuicaoTotal/365 >= (isHomem ? 35 : 30)) && pontuacaoInteira >= ptG.pontos,
    requisitos: [
      { label: "Idade", esperado: isHomem ? "62" : "56", atual: `${Math.floor(idadeDias/365)}`, cumpre: (idadeDias/365 >= (isHomem ? 62 : 56)) },
      { label: "Pontos", esperado: ptG.label, atual: `${pontuacaoInteira}`, cumpre: pontuacaoInteira >= ptG.pontos }
    ]
  });

  if (isProfessor) {
    regras.push({
      nome: "Regra 3/4 - Transição - Pontos - Especial Professor",
      descricao: "Exclusivo PEBPM. Redução de idade e tempo regência.",
      cumpre: (idadeDias/365 >= (isHomem ? 57 : 51)) && (data.tempoRegencia >= (isHomem ? 30 : 25)) && pontuacaoInteira >= ptP.pontos,
      requisitos: [
        { label: "Idade", esperado: isHomem ? "57" : "51", atual: `${Math.floor(idadeDias/365)}`, cumpre: (idadeDias/365 >= (isHomem ? 57 : 51)) },
        { label: "Regência", esperado: isHomem ? "30" : "25", atual: `${data.tempoRegencia}`, cumpre: data.tempoRegencia >= (isHomem ? 30 : 25) },
        { label: "Pontos", esperado: ptP.label, atual: `${pontuacaoInteira}`, cumpre: pontuacaoInteira >= ptP.pontos }
      ]
    });
  }

  // --- REGRAS DE PEDÁGIO (50%) ---

  regras.push({
    nome: "Regra 1 - Transição - Pedágio - Geral - Integral - Com paridade",
    descricao: "Ingresso até 31/12/2003. Pedágio de 50%.",
    cumpre: data.ingressouAte2003 && (idadeDias/365 >= (isHomem ? 60 : 55)) && (tempoContribuicaoTotal/365 >= (isHomem ? 35 : 30)) && (tempoContribuicaoTotal >= metaTempoGeral + pedagio50),
    requisitos: [
      { label: "Ingresso até 2003", esperado: "Sim", atual: data.ingressouAte2003 ? "Sim" : "Não", cumpre: data.ingressouAte2003 },
      { label: "Idade", esperado: isHomem ? "60" : "55", atual: `${Math.floor(idadeDias/365)}`, cumpre: (idadeDias/365 >= (isHomem ? 60 : 55)) },
      { label: "Tempo Contrib.", esperado: isHomem ? "35" : "30", atual: `${Math.floor(tempoContribuicaoTotal/365)}`, cumpre: (tempoContribuicaoTotal/365 >= (isHomem ? 35 : 30)) },
      { label: "Pedágio (50%)", esperado: `${pedagio50} d`, atual: `${Math.max(0, tempoContribuicaoTotal - metaTempoGeral)} d`, cumpre: (tempoContribuicaoTotal >= metaTempoGeral + pedagio50) }
    ]
  });

  regras.push({
    nome: "Regra 2 - Transição - Pedágio - Geral - Média integral - Sem paridade",
    descricao: "Ingresso entre 2004 e 2020. Pedágio de 50%.",
    cumpre: data.ingressouEntre2003e2020 && (idadeDias/365 >= (isHomem ? 60 : 55)) && (tempoContribuicaoTotal/365 >= (isHomem ? 35 : 30)) && (tempoContribuicaoTotal >= metaTempoGeral + pedagio50),
    requisitos: [
      { label: "Ingresso 2004-2020", esperado: "Sim", atual: data.ingressouEntre2003e2020 ? "Sim" : "Não", cumpre: data.ingressouEntre2003e2020 },
      { label: "Idade", esperado: isHomem ? "60" : "55", atual: `${Math.floor(idadeDias/365)}`, cumpre: (idadeDias/365 >= (isHomem ? 60 : 55)) },
      { label: "Pedágio (50%)", esperado: `${pedagio50} d`, atual: `${Math.max(0, tempoContribuicaoTotal - metaTempoGeral)} d`, cumpre: (tempoContribuicaoTotal >= metaTempoGeral + pedagio50) }
    ]
  });

  if (isProfessor) {
    const metaTempoProf = (isHomem ? 30 : 25) * 365;
    const saldoProfCorte = Math.max(0, metaTempoProf - tempoPMMG_Corte);
    const pedagioProf50 = Math.ceil(saldoProfCorte * 0.5);
    
    regras.push({
      nome: "Regra 3 - Transição - Pedágio - Especial Professor - Integral",
      descricao: "Exclusivo PEBPM. Ingresso até 2003. Pedágio 50%.",
      cumpre: data.ingressouAte2003 && (idadeDias/365 >= (isHomem ? 55 : 50)) && (data.tempoRegencia >= (isHomem ? 30 : 25)) && (tempoContribuicaoTotal >= metaTempoProf + pedagioProf50),
      requisitos: [
        { label: "Ingresso até 2003", esperado: "Sim", atual: data.ingressouAte2003 ? "Sim" : "Não", cumpre: data.ingressouAte2003 },
        { label: "Idade", esperado: isHomem ? "55" : "50", atual: `${Math.floor(idadeDias/365)}`, cumpre: (idadeDias/365 >= (isHomem ? 55 : 50)) },
        { label: "Regência", esperado: isHomem ? "30" : "25", atual: `${data.tempoRegencia}`, cumpre: data.tempoRegencia >= (isHomem ? 30 : 25) },
        { label: "Pedágio (50%)", esperado: `${pedagioProf50} d`, atual: `${Math.max(0, tempoContribuicaoTotal - metaTempoProf)} d`, cumpre: (tempoContribuicaoTotal >= metaTempoProf + pedagioProf50) }
      ]
    });

    regras.push({
      nome: "Regra 4 - Transição - Pedágio - Especial Professor - Média",
      descricao: "Exclusivo PEBPM. Ingresso 2004-2020. Pedágio 50%.",
      cumpre: data.ingressouEntre2003e2020 && (idadeDias/365 >= (isHomem ? 55 : 50)) && (data.tempoRegencia >= (isHomem ? 30 : 25)) && (tempoContribuicaoTotal >= metaTempoProf + pedagioProf50),
      requisitos: [
        { label: "Ingresso 2004-2020", esperado: "Sim", atual: data.ingressouEntre2003e2020 ? "Sim" : "Não", cumpre: data.ingressouEntre2003e2020 },
        { label: "Idade", esperado: isHomem ? "55" : "50", atual: `${Math.floor(idadeDias/365)}`, cumpre: (idadeDias/365 >= (isHomem ? 55 : 50)) },
        { label: "Pedágio (50%)", esperado: `${pedagioProf50} d`, atual: `${Math.max(0, tempoContribuicaoTotal - metaTempoProf)} d`, cumpre: (tempoContribuicaoTotal >= metaTempoProf + pedagioProf50) }
      ]
    });
  }

  // --- REGRAS PERMANENTES ---

  regras.push({
    nome: "Regra Permanente 1 - Geral",
    descricao: "Idade 65/62 anos e 25 anos de contribuição mínima.",
    cumpre: (idadeDias/365 >= (isHomem ? 65 : 62)) && (tempoContribuicaoTotal/365 >= 25),
    requisitos: [
      { label: "Idade", esperado: isHomem ? "65" : "62", atual: `${Math.floor(idadeDias/365)}`, cumpre: (idadeDias/365 >= (isHomem ? 65 : 62)) },
      { label: "Contribuição", esperado: "25", atual: `${Math.floor(tempoContribuicaoTotal/365)}`, cumpre: (tempoContribuicaoTotal/365 >= 25) }
    ]
  });

  if (isProfessor) {
    regras.push({
      nome: "Regra Permanente 2 - Especial Professor",
      descricao: "Exclusivo PEBPM. Idade 60/57 anos e 25 anos de regência.",
      cumpre: (idadeDias/365 >= (isHomem ? 60 : 57)) && (data.tempoRegencia >= 25),
      requisitos: [
        { label: "Idade", esperado: isHomem ? "60" : "57", atual: `${Math.floor(idadeDias/365)}`, cumpre: (idadeDias/365 >= (isHomem ? 60 : 57)) },
        { label: "Regência", esperado: "25", atual: `${data.tempoRegencia}`, cumpre: data.tempoRegencia >= 25 }
      ]
    });
  }

  const dComp = new Date(dNasc.getFullYear() + 75, dNasc.getMonth(), dNasc.getDate());
  regras.push({
    nome: "Regra Permanente 3 - Compulsória",
    descricao: "Afastamento obrigatório aos 75 anos de idade.",
    cumpre: dSim.getTime() >= dComp.getTime(),
    requisitos: [
      { label: "Idade Limite", esperado: "75 anos", atual: `${Math.floor(idadeDias/365)}`, cumpre: dSim.getTime() >= dComp.getTime() },
      { label: "Data Limite", esperado: formatDateBR(dComp), atual: formatDateBR(dComp), cumpre: true }
    ]
  });

  return { calc, regras };
};
