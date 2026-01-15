
import { FormState, CalculosFinais, RegraResultado } from '../types';
import { parseISO, diffInDays, calculateAgeDaysSpecific, formatDaysToYMD, addDays, formatDateBR } from './dateHelpers';

/**
 * Calcula quantos dias de um intervalo [inicio, fim] ocorreram até uma data limite.
 */
const getDaysUntilLimit = (startStr: string, endStr: string, limit: Date): number => {
  if (!startStr || !endStr) return 0;
  const start = parseISO(startStr);
  const end = parseISO(endStr);
  
  if (start > limit) return 0;
  const effectiveEnd = end > limit ? limit : end;
  
  return diffInDays(start, effectiveEnd);
};

export const calculateResults = (data: FormState): { calc: CalculosFinais; regras: RegraResultado[] } => {
  const dSim = parseISO(data.dataSimulacao);
  const dNasc = parseISO(data.dataNascimento);
  const dInc = parseISO(data.dataInclusaoPMMG);
  const dCorte = new Date('2020-09-15T00:00:00');

  // APLICAÇÃO DA LÓGICA SOLICITADA:
  // Tempo de Serviço PMMG = Data Simulação - Data Inclusão (Convertido em dias inclusive)
  const tempoServicoPMMGDias = diffInDays(dInc, dSim);

  const { totalDias: idadeDias, formatada: idadeFormatada } = calculateAgeDaysSpecific(dNasc, dSim);
  const totalTempoAverbado = data.averbacoes.reduce((acc, av) => acc + av.dias, 0);
  const totalTempoDescontado = data.descontos.reduce((acc, desc) => acc + desc.dias, 0);
  
  const tempoEfetivoCivilPMMG = tempoServicoPMMGDias - totalTempoDescontado;
  const tempoContribuicaoTotal = tempoEfetivoCivilPMMG + totalTempoAverbado;

  const isProfessor = data.tipoServidor === 'PEBPM';
  const isHomem = data.sexo === 'Masculino';
  const redutorProfAnos = isProfessor ? 5 : 0;

  // Cálculo rigoroso da situação no corte (15/09/2020)
  const tempoPMMG_Corte = dInc <= dCorte ? diffInDays(dInc, dCorte) : 0;
  const averbacoesCorte = data.averbacoes.reduce((acc, av) => acc + getDaysUntilLimit(av.dataInicial, av.dataFinal, dCorte), 0);
  const descontosCorte = data.descontos.reduce((acc, desc) => acc + getDaysUntilLimit(desc.dataInicial, desc.dataFinal, dCorte), 0);

  const tempoEfetivo15092020 = Math.max(0, tempoPMMG_Corte + averbacoesCorte - descontosCorte);

  let tempoMinimoExigidoDias = 0;
  if (isProfessor) {
    tempoMinimoExigidoDias = (isHomem ? 30 : 25) * 365;
  } else {
    tempoMinimoExigidoDias = (isHomem ? 35 : 30) * 365;
  }

  const saldoFaltanteCorte = Math.max(0, tempoMinimoExigidoDias - tempoEfetivo15092020);
  const pedagio50 = Math.ceil(saldoFaltanteCorte * 0.5);
  const tempoACumprir50 = tempoMinimoExigidoDias + pedagio50;
  const tempoACumprir100 = tempoMinimoExigidoDias + saldoFaltanteCorte;

  // Projeção baseada no tempo líquido a cumprir descontando averbações e somando descontos
  const diasParaAdicionar = tempoACumprir50 + totalTempoDescontado - totalTempoAverbado;
  const dataPrevistaAposentadoria = formatDateBR(addDays(dInc, diasParaAdicionar - 1));

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

  // Implementação das Regras de Transição (Pontos, 50%, 100% e Permanente)
  // ... (Manteve as mesmas lógicas de condições das regras conforme EC 104/2020)
  
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
    nome: "Regra 1 - Transição - Pontos",
    descricao: "Exige idade mínima, tempo de contribuição e pontuação progressiva (Idade + Tempo).",
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
      { label: "Pontos na Data", esperado: `${pontosNecessarios} pts`, atual: `${calc.pontuacao} pts`, cumpre: calc.pontuacao >= pontosNecessarios },
      { label: "10 anos Serv. Público", esperado: "Sim", atual: data.dezAnosServicoPublico ? "Sim" : "Não", cumpre: data.dezAnosServicoPublico },
      { label: "05 anos Cargo Atual", esperado: "Sim", atual: data.cincoAnosCargoEfetivo ? "Sim" : "Não", cumpre: data.cincoAnosCargoEfetivo }
    ]
  });

  const idadeMinimaPedagio50 = (isHomem ? 60 : 55) - redutorProfAnos;
  regras.push({
    nome: "Regra 2 - Transição - Pedágio 50%",
    descricao: "Aplicável a quem estava a menos de 2 anos da aposentadoria em 15/09/2020.",
    cumpre: data.ingressouAte2003 && 
            (idadeDias / 365 >= idadeMinimaPedagio50) && 
            (tempoContribuicaoTotal >= tempoACumprir50) && 
            data.dezAnosServicoPublico && 
            data.cincoAnosCargoEfetivo,
    requisitos: [
      { label: "Ingresso até 31/12/2003", esperado: "Sim", atual: data.ingressouAte2003 ? "Sim" : "Não", cumpre: data.ingressouAte2003 },
      { label: "Idade Mínima", esperado: `${idadeMinimaPedagio50} anos`, atual: `${Math.floor(idadeDias/365)} anos`, cumpre: (idadeDias/365) >= idadeMinimaPedagio50 },
      { label: "Tempo + Pedágio (50%)", esperado: `${formatDaysToYMD(tempoACumprir50)}`, atual: `${formatDaysToYMD(tempoContribuicaoTotal)}`, cumpre: tempoContribuicaoTotal >= tempoACumprir50 },
      { label: "10 anos Serv. Público", esperado: "Sim", atual: data.dezAnosServicoPublico ? "Sim" : "Não", cumpre: data.dezAnosServicoPublico },
      { label: "05 anos Cargo Atual", esperado: "Sim", atual: data.cincoAnosCargoEfetivo ? "Sim" : "Não", cumpre: data.cincoAnosCargoEfetivo }
    ]
  });

  const idadeMinimaPedagio100 = (isHomem ? 60 : 57) - redutorProfAnos;
  regras.push({
    nome: "Regra 3 - Transição - Pedágio 100%",
    descricao: "Exige idade mínima e cumprimento do dobro do tempo que faltava em 15/09/2020.",
    cumpre: (idadeDias / 365 >= idadeMinimaPedagio100) && 
            (tempoContribuicaoTotal >= tempoACumprir100) && 
            data.dezAnosServicoPublico && 
            data.cincoAnosCargoEfetivo,
    requisitos: [
      { label: "Idade Mínima", esperado: `${idadeMinimaPedagio100} anos`, atual: `${Math.floor(idadeDias/365)} anos`, cumpre: (idadeDias/365) >= idadeMinimaPedagio100 },
      { label: "Tempo + Pedágio (100%)", esperado: `${formatDaysToYMD(tempoACumprir100)}`, atual: `${formatDaysToYMD(tempoContribuicaoTotal)}`, cumpre: tempoContribuicaoTotal >= tempoACumprir100 },
      { label: "10 anos Serv. Público", esperado: "Sim", atual: data.dezAnosServicoPublico ? "Sim" : "Não", cumpre: data.dezAnosServicoPublico },
      { label: "05 anos Cargo Atual", esperado: "Sim", atual: data.cincoAnosCargoEfetivo ? "Sim" : "Não", cumpre: data.cincoAnosCargoEfetivo }
    ]
  });

  const idadePermanente = (isHomem ? 65 : 62) - redutorProfAnos;
  const tempoPermanenteDias = 25 * 365;
  regras.push({
    nome: "Regra Permanente (Pós-Reforma)",
    descricao: "Regra geral para novos ingressos ou quem não se enquadra nas transições.",
    cumpre: (idadeDias / 365 >= idadePermanente) && 
            (tempoContribuicaoTotal >= tempoPermanenteDias) && 
            data.dezAnosServicoPublico && 
            data.cincoAnosCargoEfetivo,
    requisitos: [
      { label: "Idade Mínima", esperado: `${idadePermanente} anos`, atual: `${Math.floor(idadeDias/365)} anos`, cumpre: (idadeDias/365) >= idadePermanente },
      { label: "Tempo Contribuição", esperado: "25 anos", atual: `${Math.floor(tempoContribuicaoTotal/365)} anos`, cumpre: tempoContribuicaoTotal >= tempoPermanenteDias },
      { label: "10 anos Serv. Público", esperado: "Sim", atual: data.dezAnosServicoPublico ? "Sim" : "Não", cumpre: data.dezAnosServicoPublico },
      { label: "05 anos Cargo Atual", esperado: "Sim", atual: data.cincoAnosCargoEfetivo ? "Sim" : "Não", cumpre: data.cincoAnosCargoEfetivo }
    ]
  });

  return { calc, regras };
};
