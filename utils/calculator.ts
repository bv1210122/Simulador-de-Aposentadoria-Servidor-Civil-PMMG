import { FormState, CalculosFinais, RegraResultado } from '../types';
import { parseISO, addDays, formatDateBR, diffInDays, calculateCalendarPeriod } from './calculoDatas';

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

  // 1. Apuração de Tempos Básicos
  const tempos = apurarTemposBasicos(data);

  // Atualiza o valor de regência na cópia dos dados para avaliação das regras
  const evaluatedData = { 
    ...data, 
    TempoDeRegência: tempos.tempoRegenciaTotalAnos 
  };

  // 2. Cálculo da Pontuação
  const { pontuacaoTotalDias, pontuacaoInteira } = calcularPontuacao(tempos.idadeDias, tempos.tempoContribTotal);

  // 3. Cálculo de Pedágio
  const metaTempoGeral = (isProfessor ? (isHomem ? 30 : 25) : (isHomem ? 35 : 30)) * 365;
  const infoPedagio = calcularPedagio50(
    dInc, 
    tempos.totalTempoAverbado + tempos.totalFeriasPremioAnterior, 
    tempos.totalDescontadoAnterior, 
    metaTempoGeral
  );
  
  const diasCumpridosPosCorte = dSim >= dCorte ? diffInDays(dCorte, dSim) : 0;

  // 4. Avaliação das Regras
  const regras: RegraResultado[] = [];

  // Regras de Pontos (Geral e Professor) - Agora retornam Arrays
  regras.push(...avaliarRegraPontosGeral(evaluatedData, dSim, tempos.idadeAnos, tempos.tempoContribAnos, pontuacaoInteira));
  regras.push(...avaliarRegraPontosProfessor(evaluatedData, dSim, tempos.idadeAnos, pontuacaoInteira));

  // Regras de Pedágio
  regras.push(...avaliarRegraPedagioGeral(evaluatedData, tempos.idadeAnos, tempos.tempoContribTotal, metaTempoGeral, infoPedagio.pedagio));
  regras.push(...avaliarRegraPedagioProfessor(evaluatedData, tempos.idadeAnos, tempos.tempoContribTotal, infoPedagio.pedagio));
  
  // Regras Permanentes
  regras.push(...avaliarRegrasPermanentes(evaluatedData, dSim, dComp, tempos.idadeAnos, tempos.tempoContribAnos));

  // 5. Consolidação Final
  const calc: CalculosFinais = {
    idadeDias: tempos.idadeDias, 
    idadeFormatada: tempos.idadeFormatada, 
    tempoServicoPMMGDias: tempos.tempoServicoPMMGDias, 
    totalTempoAverbado: tempos.totalTempoAverbado, 
    totalAverbadoAnterior: tempos.totalAverbadoAnterior,
    totalTempoDescontado: tempos.totalTempoDescontado,
    totalDescontadoAnterior: tempos.totalDescontadoAnterior,
    totalFeriasPremio: tempos.totalFeriasPremio,
    totalFeriasPremioAnterior: tempos.totalFeriasPremioAnterior,
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
    diasCumpridosPosCorte,
    tempoRegenciaAverbadoAnos: tempos.tempoRegenciaAverbadoAnos,
    tempoRegenciaTotalAnos: tempos.tempoRegenciaTotalAnos
  };

  return { calc, regras };
};
