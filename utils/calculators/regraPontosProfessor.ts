
import { FormState, RegraResultado } from '../../types';
import { getMetaPontosProfessor } from './pontos';
import { createReq } from './helper';

export const avaliarRegraPontosProfessor = (
  data: FormState,
  dataSimulacao: Date,
  idadeAnos: number,
  pontuacaoAtual: number
): RegraResultado | null => {
  if (data.tipoServidor !== 'PEBPM') return null;

  const isHomem = data.sexo === 'Masculino';
  const meta = getMetaPontosProfessor(data.sexo!, dataSimulacao);
  
  const idadeMinima = isHomem ? 57 : 51;
  const regenciaMinima = isHomem ? 30 : 25;

  const cumpreIdade = idadeAnos >= idadeMinima;
  const cumpreRegencia = data.tempoRegencia >= regenciaMinima;
  const cumprePontos = pontuacaoAtual >= meta.pontos;

  const cumpre = cumpreIdade && cumpreRegencia && cumprePontos;

  return {
    nome: "Regra Transição - Pontos (Professor)",
    descricao: "Exclusivo PEBPM. Soma da idade + tempo. Redução de 5 anos nos requisitos.",
    cumpre,
    requisitos: [
      createReq("Idade Mínima", idadeMinima, idadeAnos, cumpreIdade),
      createReq("Tempo Regência", regenciaMinima, data.tempoRegencia, cumpreRegencia),
      createReq("Pontos", meta.label, pontuacaoAtual, cumprePontos)
    ]
  };
};
