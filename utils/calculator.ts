
import { FormState, CalculosFinais, RegraResultado } from '../types';
import { parseISO, addDays, formatDateBR } from './dateHelpers';

// Importação dos Módulos Especializados
import { apurarTemposBasicos } from './calculators/temposBasicos';
import { calcularPedagio50 } from './calculators/pedagio';
import { avaliarRegraPedagioGeral } from './calculators/regraPedagioGeral';
import { avaliarRegraPedagioProfessor } from './calculators/regraPedagioProfessor';
import { avaliarRegraPontosGeral } from './calculators/regraPontosGeral';
import { avaliarRegraPontosProfessor } from './calculators/regraPontosProfessor';
import { avaliarRegrasPermanentes } from './calculators/regrasPermanentes';

export const calculateResults = (data: FormState): { calc: CalculosFinais; regras: RegraResultado[] } => {
  const dSim = parseISO(data.dataSimulacao);
  const dNasc = parseISO(data.dataNascimento);
  const dInc = parseISO(data.dataInclusaoPMMG);
  const dComp = new Date(dNasc.getFullYear() + 75, dNasc.getMonth(), dNasc.getDate());

  const isProfessor = data.tipoServidor === 'PEBPM';
  const isHomem = data.sexo === 'Masculino';

  // 1. Apuração de Tempos Básicos (Módulo Isolado)
  const tempos = apurarTemposBasicos(data);

  // 2. Cálculos de Pedágio (50% da EC 104/2020)
  const metaTempoGeral = (isProfessor ? (isHomem ? 30 : 25) : (isHomem ? 35 : 30)) * 365;
  const infoPedagio = calcularPedagio50(dInc, metaTempoGeral);

  // 3. Orquestração das Regras
  const regras: RegraResultado[] = [];

  // Regra de Pontos Geral
  regras.push(avaliarRegraPontosGeral(data, dSim, tempos.idadeAnos, tempos.tempoContribAnos, tempos.pontuacaoInteira));

  // Regra de Pontos Professor
  const rPontosProf = avaliarRegraPontosProfessor(data, dSim, tempos.idadeAnos, tempos.pontuacaoInteira);
  if (rPontosProf) regras.push(rPontosProf);

  // Regras de Pedágio Geral
  regras.push(...avaliarRegraPedagioGeral(data, tempos.idadeAnos, tempos.tempoContribTotal, metaTempoGeral, infoPedagio.pedagio));

  // Regras de Pedágio Professor
  regras.push(...avaliarRegraPedagioProfessor(data, tempos.idadeAnos, tempos.tempoContribTotal, infoPedagio.pedagio));

  // Regras Permanentes
  regras.push(...avaliarRegrasPermanentes(data, dSim, dComp, tempos.idadeAnos, tempos.tempoContribAnos));

  // 4. Montagem do Objeto Final
  const calc: CalculosFinais = {
    idadeDias: tempos.idadeDias, 
    idadeFormatada: tempos.idadeFormatada, 
    tempoServicoPMMGDias: tempos.tempoServicoPMMGDias, 
    totalTempoAverbado: tempos.totalTempoAverbado, 
    totalTempoDescontado: tempos.totalTempoDescontado,
    tempoEfetivoCivilPMMG: tempos.tempoServicoPMMGDias, 
    tempoContribuicaoTotal: tempos.tempoContribTotal,
    pontuacao: tempos.pontuacaoInteira, 
    pontuacaoSaldoDias: tempos.pontuacaoTotalDias % 365,
    pedagioApurado: infoPedagio.pedagio,
    tempoACumprir: metaTempoGeral + infoPedagio.pedagio,
    dataPrevistaAposentadoria: formatDateBR(addDays(dSim, Math.max(0, (metaTempoGeral + infoPedagio.pedagio) - tempos.tempoContribTotal))),
    data75Anos: formatDateBR(dComp),
    tempoEfetivo15092020: infoPedagio.tempoNoCorte,
    tempoMinimoExigidoDias: metaTempoGeral,
    saldoFaltanteCorte: infoPedagio.saldoNoCorte
  };

  return { calc, regras };
};
