
import { FormState } from '../../types';
import { calculatePMMGPeriod, parseISO } from '../dateHelpers';

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

export const apurarTemposBasicos = (data: FormState): TemposBasicosResultado => {
  const dSim = parseISO(data.dataSimulacao);
  const dNasc = parseISO(data.dataNascimento);
  const dInc = parseISO(data.dataInclusaoPMMG);

  // 1. Idade usando lógica PMMG
  const idadeInfo = calculatePMMGPeriod(dNasc, dSim);

  // 2. Tempo de Serviço Efetivo PMMG usando lógica PMMG
  const tempoPMMGInfo = calculatePMMGPeriod(dInc, dSim);

  // 3. Totais de Averbações e Descontos
  const totalTempoAverbado = data.averbacoes.reduce((acc, av) => acc + (Number(av.anos) * 365) + Number(av.dias), 0);
  const totalTempoDescontado = data.descontos.reduce((acc, desc) => acc + desc.dias, 0);

  // 4. Tempo de Contribuição Total (Líquido)
  const tempoContribTotal = tempoPMMGInfo.totalDias + totalTempoAverbado - totalTempoDescontado;
  const tempoContribAnos = Math.floor(tempoContribTotal / 365);

  // 5. Base para Pontuação (Idade + Contribuição)
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
