
import { FormState } from '../../types';
import { diffInDays, calculateAgeDaysSpecific, parseISO } from '../dateHelpers';

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

  // 1. Idade
  const { totalDias: idadeDias, formatada: idadeFormatada } = calculateAgeDaysSpecific(dNasc, dSim);
  const idadeAnos = Math.floor(idadeDias / 365);

  // 2. Tempo de Serviço Efetivo PMMG
  const tempoServicoPMMGDias = diffInDays(dInc, dSim);

  // 3. Totais de Averbações e Descontos
  // Agora considera anos * 365 + dias
  const totalTempoAverbado = data.averbacoes.reduce((acc, av) => acc + (Number(av.anos) * 365) + Number(av.dias), 0);
  
  const totalTempoDescontado = data.descontos.reduce((acc, desc) => acc + desc.dias, 0);

  // 4. Tempo de Contribuição Total (Líquido)
  const tempoContribTotal = tempoServicoPMMGDias + totalTempoAverbado - totalTempoDescontado;
  const tempoContribAnos = Math.floor(tempoContribTotal / 365);

  // 5. Base para Pontuação (Idade + Contribuição)
  const pontuacaoTotalDias = idadeDias + tempoContribTotal;
  const pontuacaoInteira = Math.floor(pontuacaoTotalDias / 365);

  return {
    idadeDias,
    idadeAnos,
    idadeFormatada,
    tempoServicoPMMGDias,
    totalTempoAverbado,
    totalTempoDescontado,
    tempoContribTotal,
    tempoContribAnos,
    pontuacaoTotalDias,
    pontuacaoInteira
  };
};
