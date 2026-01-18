
import { FormState, CalculosFinais, RegraResultado } from '../types';
import { parseISO, addDays, formatDateBR } from './calculoDatas';

// Módulos especializados em partes específicas da regra de aposentadoria
import { apurarTemposBasicos } from './calculators/temposBasicos';
import { calcularPedagio50 } from './calculators/pedagio';
import { avaliarRegraPedagioGeral } from './calculators/regraPedagioGeral';
import { avaliarRegraPedagioProfessor } from './calculators/regraPedagioProfessor';
import { avaliarRegraPontosGeral } from './calculators/regraPontosGeral';
import { avaliarRegraPontosProfessor } from './calculators/regraPontosProfessor';
import { avaliarRegrasPermanentes } from './calculators/regrasPermanentes';

/**
 * Função Orquestradora: Recebe os dados do formulário e executa todos os módulos de cálculo.
 * Retorna um objeto com os cálculos consolidados e uma lista de resultados para cada regra avaliada.
 */
export const calculateResults = (data: FormState): { calc: CalculosFinais; regras: RegraResultado[] } => {
  const dSim = parseISO(data.dataSimulacao);
  const dNasc = parseISO(data.dataNascimento);
  const dInc = parseISO(data.dataInclusaoPMMG);
  
  // Data da aposentadoria compulsória (75 anos)
  const dComp = new Date(dNasc.getFullYear() + 75, dNasc.getMonth(), dNasc.getDate());

  const isProfessor = data.tipoServidor === 'PEBPM';
  const isHomem = data.sexo === 'Masculino';

  // 1. Apuração de Tempos: Idade, Tempo de Casa, Averbados e Descontos
  const tempos = apurarTemposBasicos(data);

  // 2. Pedágio (EC 104/2020): Define quantos dias faltavam em 15/09/2020 para a meta de 30/35 anos
  const metaTempoGeral = (isProfessor ? (isHomem ? 30 : 25) : (isHomem ? 35 : 30)) * 365;
  const infoPedagio = calcularPedagio50(dInc, metaTempoGeral);

  // 3. Avaliação das Regras de Transição e Permanentes
  const regras: RegraResultado[] = [];

  // Avalia transição por Pontuação (Idade + Tempo)
  regras.push(avaliarRegraPontosGeral(data, dSim, tempos.idadeAnos, tempos.tempoContribAnos, tempos.pontuacaoInteira));

  // Regra específica para professores
  const rPontosProf = avaliarRegraPontosProfessor(data, dSim, tempos.idadeAnos, tempos.pontuacaoInteira);
  if (rPontosProf) regras.push(rPontosProf);

  // Regras de Pedágio (exigem cumprimento do tempo que faltava + 50% de adicional)
  regras.push(...avaliarRegraPedagioGeral(data, tempos.idadeAnos, tempos.tempoContribTotal, metaTempoGeral, infoPedagio.pedagio));
  regras.push(...avaliarRegraPedagioProfessor(data, tempos.idadeAnos, tempos.tempoContribTotal, infoPedagio.pedagio));

  // Regras Permanentes (Pós-reforma: idade mínima elevada) e Compulsória
  regras.push(...avaliarRegrasPermanentes(data, dSim, dComp, tempos.idadeAnos, tempos.tempoContribAnos));

  // 4. Consolidação: Cria o resumo financeiro/temporal para exibição nos cards superiores
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
    // Projeção da data: Adiciona os dias faltantes (Meta + Pedágio - Atual) à data de simulação
    dataPrevistaAposentadoria: formatDateBR(addDays(dSim, Math.max(0, (metaTempoGeral + infoPedagio.pedagio) - tempos.tempoContribTotal))),
    data75Anos: formatDateBR(dComp),
    tempoEfetivo15092020: infoPedagio.tempoNoCorte,
    tempoMinimoExigidoDias: metaTempoGeral,
    saldoFaltanteCorte: infoPedagio.saldoNoCorte
  };

  return { calc, regras };
};
