import { FormState } from '../../types';
import { diffInDays, parseISO, calculateCalendarPeriod } from '../calculoDatas';
import { calculateIdadePMMG } from './idade';

/**
 * Estrutura de retorno focada estritamente em períodos cronológicos.
 */
export interface TemposBasicosResultado {
  idadeDias: number;
  idadeAnos: number;
  idadeFormatada: string;
  tempoServicoPMMGDias: number;
  tempoServicoPMMGAnos: number;
  tempoServicoPMMGFormatado: string;
  totalTempoAverbado: number;
  totalAverbadoAnterior: number;
  totalTempoDescontado: number;
  totalDescontadoAnterior: number;
  totalFeriasPremio: number;
  totalFeriasPremioAnterior: number;
  tempoContribTotal: number;
  tempoContribAnos: number;
  tempoRegenciaAverbadoAnos: number;
  tempoRegenciaTotalAnos: number;
}

/**
 * Processa as datas principais para gerar a base cronológica da simulação.
 * Conforme orientações atualizadas:
 * 1. Idade Real: Regra SEPLAG -> (Anos * 365) + Saldo inclusivo pós-aniversário.
 * 2. Tempo PMMG (Bruto): Contagem dia a dia real (Date2 - Date1). 
 *    Ex: 01/01/2015 a 28/01/2026 = 4045 dias (11 anos e 27 dias).
 */
export const apurarTemposBasicos = (data: FormState): TemposBasicosResultado => {
  const dSim = parseISO(data.dataSimulacao);
  const dNasc = parseISO(data.dataNascimento);
  const dInc = parseISO(data.dataInclusaoPMMG);

  // 1. Idade: Tempo decorrido do nascimento até a simulação 
  const idadeInfo = calculateIdadePMMG(dNasc, dSim);

  // 2. Tempo de Casa: Tempo efetivo como servidor civil na PMMG
  const tempoServicoPMMGDias = diffInDays(dInc, dSim);
  const tempoServicoPMMGInfo = calculateCalendarPeriod(dInc, dSim);

  // 3. Totais Externos (Averbações e Descontos)
  const totalTempoAverbado = data.averbacoes.reduce((acc, av) => acc + (Number(av.anos) * 365) + Number(av.dias), 0);
  const totalAverbadoAnterior = data.averbacoes
    .filter(av => av.anteriorReforma)
    .reduce((acc, av) => acc + (Number(av.anos) * 365) + Number(av.dias), 0);

  // Cálculo de Regência Averbada (em anos para simplificação de soma de carreira docente)
  const tempoRegenciaAverbadoAnos = data.averbacoes
    .filter(av => av.isRegencia)
    .reduce((acc, av) => acc + Number(av.anos) + (Number(av.dias) / 365), 0);

  const totalTempoDescontado = data.descontos.reduce((acc, desc) => acc + desc.dias, 0);
  const totalDescontadoAnterior = data.descontos
    .filter(desc => desc.anteriorReforma)
    .reduce((acc, desc) => acc + desc.dias, 0);

  // 4. Férias-Prêmio em Dobro
  const totalFeriasPremio = data.feriasPremio.reduce((acc, fp) => acc + (fp.dias * 2), 0);
  const totalFeriasPremioAnterior = totalFeriasPremio; 

  // 5. Tempo de Contribuição Líquido
  const tempoContribTotal = tempoServicoPMMGDias + totalTempoAverbado + totalFeriasPremio - totalTempoDescontado;
  const tempoContribAnos = Math.floor(tempoContribTotal / 365);

  // Cálculo final da Regência: Averbado + PMMG
  const tempoRegenciaTotalAnos = Math.floor(tempoRegenciaAverbadoAnos + tempoServicoPMMGInfo.anos + (tempoServicoPMMGInfo.dias / 365));

  return {
    idadeDias: idadeInfo.totalDias,
    idadeAnos: idadeInfo.anos,
    idadeFormatada: idadeInfo.formatada,
    tempoServicoPMMGDias: tempoServicoPMMGDias,
    tempoServicoPMMGAnos: tempoServicoPMMGInfo.anos,
    tempoServicoPMMGFormatado: tempoServicoPMMGInfo.formatada,
    totalTempoAverbado,
    totalAverbadoAnterior,
    totalTempoDescontado,
    totalDescontadoAnterior,
    totalFeriasPremio,
    totalFeriasPremioAnterior,
    tempoContribTotal,
    tempoContribAnos,
    tempoRegenciaAverbadoAnos: Math.floor(tempoRegenciaAverbadoAnos),
    tempoRegenciaTotalAnos: tempoRegenciaTotalAnos
  };
};