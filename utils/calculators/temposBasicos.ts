
import { FormState } from '../../types';
import { calculatePMMGPeriod, parseISO } from '../calculoDatas';

/**
 * Estrutura de retorno focada estritamente em períodos cronológicos.
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
}

/**
 * Processa as datas principais para gerar a base cronológica da simulação.
 */
export const apurarTemposBasicos = (data: FormState): TemposBasicosResultado => {
  const dSim = parseISO(data.dataSimulacao);
  const dNasc = parseISO(data.dataNascimento);
  const dInc = parseISO(data.dataInclusaoPMMG);

  // 1. Idade: Tempo decorrido do nascimento até a simulação
  const idadeInfo = calculatePMMGPeriod(dNasc, dSim);

  // 2. Tempo de Casa: Tempo efetivo como servidor civil na PMMG
  const tempoPMMGInfo = calculatePMMGPeriod(dInc, dSim);

  // 3. Totais Externos (Averbações e Descontos)
  const totalTempoAverbado = data.averbacoes.reduce((acc, av) => acc + (Number(av.anos) * 365) + Number(av.dias), 0);
  const totalTempoDescontado = data.descontos.reduce((acc, desc) => acc + desc.dias, 0);

  // 4. Tempo de Contribuição Líquido
  const tempoContribTotal = tempoPMMGInfo.totalDias + totalTempoAverbado - totalTempoDescontado;
  const tempoContribAnos = Math.floor(tempoContribTotal / 365);

  return {
    idadeDias: idadeInfo.totalDias,
    idadeAnos: idadeInfo.anos,
    idadeFormatada: idadeInfo.formatada,
    tempoServicoPMMGDias: tempoPMMGInfo.totalDias,
    totalTempoAverbado,
    totalTempoDescontado,
    tempoContribTotal,
    tempoContribAnos
  };
};
