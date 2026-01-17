
import { FormState, RegraResultado } from '../../types';
import { getMetaPontosGeral } from './pontos';
import { createReq } from './helper';

export const avaliarRegraPontosGeral = (
  data: FormState,
  dataSimulacao: Date,
  idadeAnos: number,
  tempoContribAnos: number,
  pontuacaoAtual: number
): RegraResultado => {
  const isHomem = data.sexo === 'Masculino';
  const meta = getMetaPontosGeral(data.sexo!, dataSimulacao);
  
  const idadeMinima = isHomem ? 62 : 56;
  const tempoMinimo = isHomem ? 35 : 30;

  const cumpreIdade = idadeAnos >= idadeMinima;
  const cumpreTempo = tempoContribAnos >= tempoMinimo;
  const cumprePontos = pontuacaoAtual >= meta.pontos;

  const cumpre = cumpreIdade && cumpreTempo && cumprePontos;

  return {
    nome: "Regra Transição - Pontos (Geral)",
    descricao: "Soma da idade + tempo de contribuição. Pontuação progressiva anual.",
    cumpre,
    requisitos: [
      createReq("Idade Mínima", idadeMinima, idadeAnos, cumpreIdade),
      createReq("Tempo Contrib.", tempoMinimo, tempoContribAnos, cumpreTempo),
      createReq("Pontos", meta.label, pontuacaoAtual, cumprePontos)
    ]
  };
};
