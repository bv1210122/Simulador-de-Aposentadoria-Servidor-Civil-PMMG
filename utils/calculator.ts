
import { FormState, CalculosFinais, RegraResultado } from '../types';
import { parseISO, addDays, formatDateBR, diffInDays } from './calculoDatas';

// Módulos especializados
import { apurarTemposBasicos } from './calculators/temposBasicos';
import { calcularPedagio50 } from './calculators/pedagio';
import { calcularPontuacao } from './calculators/pontos';
import { avaliarRegraPedagioGeral } from './calculators/regraPedagioGeral';
import { avaliarRegraPedagioProfessor } from './calculators/regraPedagioProfessor';
import { avaliarRegraPontosGeral } from './calculators/regraPontosGeral';
import { avaliarRegraPontosProfessor } from './calculators/regraPontosProfessor';
import { avaliarRegrasPermanentes } from './calculators/regrasPermanentes';

/**
 * Função Orquestradora: Consome os módulos de base (Tempos, Pedágio, Pontos)
 * e avalia as regras de aposentadoria.
 */
export const calculateResults = (data: FormState): { calc: CalculosFinais; regras: RegraResultado[] } => {
  const dSim = parseISO(data.dataSimulacao);
  const dNasc = parseISO(data.dataNascimento);
  const dInc = parseISO(data.dataInclusaoPMMG);
  const dCorte = parseISO('2020-09-15');
  const dComp = new Date(dNasc.getFullYear() + 75, dNasc.getMonth(), dNasc.getDate());

  const isProfessor = data.tipoServidor === 'PEBPM';
  const isHomem = data.sexo === 'Masculino';

  // 1. Apuração de Tempos Básicos (Idade e Contribuição)
  const tempos = apurarTemposBasicos(data);

  // 2. Cálculo da Pontuação (Idade + Contribuição) - Agora unificado aqui
  const { pontuacaoTotalDias, pontuacaoInteira } = calcularPontuacao(tempos.idadeDias, tempos.tempoContribTotal);

  // 3. Cálculo de Pedágio (EC 104/2020)
  const metaTempoGeral = (isProfessor ? (isHomem ? 30 : 25) : (isHomem ? 35 : 30)) * 365;
  const infoPedagio = calcularPedagio50(dInc, metaTempoGeral);
  
  // Cálculo de dias cumpridos pós-reforma
  const diasCumpridosPosCorte = dSim >= dCorte ? diffInDays(dCorte, dSim) : 0;

  // 4. Avaliação das Regras
  const regras: RegraResultado[] = [];

  regras.push(avaliarRegraPontosGeral(data, dSim, tempos.idadeAnos, tempos.tempoContribAnos, pontuacaoInteira));

  const rPontosProf = avaliarRegraPontosProfessor(data, dSim, tempos.idadeAnos, pontuacaoInteira);
  if (rPontosProf) regras.push(rPontosProf);

  regras.push(...avaliarRegraPedagioGeral(data, tempos.idadeAnos, tempos.tempoContribTotal, metaTempoGeral, infoPedagio.pedagio));
  regras.push(...avaliarRegraPedagioProfessor(data, tempos.idadeAnos, tempos.tempoContribTotal, infoPedagio.pedagio));
  regras.push(...avaliarRegrasPermanentes(data, dSim, dComp, tempos.idadeAnos, tempos.tempoContribAnos));

  // 5. Consolidação Final
  const calc: CalculosFinais = {
    idadeDias: tempos.idadeDias, 
    idadeFormatada: tempos.idadeFormatada, 
    tempoServicoPMMGDias: tempos.tempoServicoPMMGDias, 
    totalTempoAverbado: tempos.totalTempoAverbado, 
    totalTempoDescontado: tempos.totalTempoDescontado,
    tempoEfetivoCivilPMMG: tempos.tempoServicoPMMGDias, 
    tempoContribuicaoTotal: tempos.tempoContribTotal,
    pontuacao: pontuacaoInteira, 
    pontuacaoSaldoDias: pontuacaoTotalDias % 365,
    pedagioApurado: infoPedagio.pedagio,
    tempoACumprir: metaTempoGeral + infoPedagio.pedagio,
    dataPrevistaAposentadoria: formatDateBR(addDays(dSim, Math.max(0, (metaTempoGeral + infoPedagio.pedagio) - tempos.tempoContribTotal))),
    data75Anos: formatDateBR(dComp),
    tempoEfetivo15092020: infoPedagio.tempoNoCorte,
    tempoMinimoExigidoDias: metaTempoGeral,
    saldoFaltanteCorte: infoPedagio.saldoNoCorte,
    diasCumpridosPosCorte
  };

  return { calc, regras };
};
