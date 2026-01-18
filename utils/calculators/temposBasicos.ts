
import { FormState } from '../../types';
import { calculatePMMGPeriod, parseISO } from '../calculoDatas';

/**
 * Estrutura de retorno com os dados temporais brutos e convertidos.
 */
export interface TemposBasicosResultado {
  idadeDias: number;
  idadeAnos: number;
  idadeFormatada: string;
  tempoServicoPMMGDias: number;
  totalTempoAverbado: number;
  totalTempoDescontado: number;
  tempoContribTotal: number;
  tempoContribAnos: number;
  pontuacaoTotalDias: number;
  pontuacaoInteira: number;
}

/**
 * Processa as datas principais para gerar a base de todos os outros cálculos.
 */
export const apurarTemposBasicos = (data: FormState): TemposBasicosResultado => {
  const dSim = parseISO(data.dataSimulacao);
  const dNasc = parseISO(data.dataNascimento);
  const dInc = parseISO(data.dataInclusaoPMMG);

  // 1. Idade: Tempo decorrido do nascimento até a simulação (lógica PMMG)
  const idadeInfo = calculatePMMGPeriod(dNasc, dSim);

  // 2. Tempo de Casa: Tempo efetivo como servidor civil na PMMG
  const tempoPMMGInfo = calculatePMMGPeriod(dInc, dSim);

  // 3. Totais Externos:
  // Averbações: Somas de tempos de outros regimes (anos * 365 + dias residuais)
  const totalTempoAverbado = data.averbacoes.reduce((acc, av) => acc + (Number(av.anos) * 365) + Number(av.dias), 0);
  // Descontos: Dias de afastamento que não contam para aposentadoria
  const totalTempoDescontado = data.descontos.reduce((acc, desc) => acc + desc.dias, 0);

  // 4. Tempo de Contribuição Líquido: (Tempo PMMG + Averbado - Descontos)
  const tempoContribTotal = tempoPMMGInfo.totalDias + totalTempoAverbado - totalTempoDescontado;
  const tempoContribAnos = Math.floor(tempoContribTotal / 365);

  // 5. Pontuação: Base para regras de transição (Soma da Idade em dias + Contribuição em dias)
  const pontuacaoTotalDias = idadeInfo.totalDias + tempoContribTotal;
  const pontuacaoInteira = Math.floor(pontuacaoTotalDias / 365);

  return {
    idadeDias: idadeInfo.totalDias,
    idadeAnos: idadeInfo.anos,
    idadeFormatada: idadeInfo.formatada,
    tempoServicoPMMGDias: tempoPMMGInfo.totalDias,
    totalTempoAverbado,
    totalTempoDescontado,
    tempoContribTotal,
    tempoContribAnos,
    pontuacaoTotalDias,
    pontuacaoInteira
  };
};
