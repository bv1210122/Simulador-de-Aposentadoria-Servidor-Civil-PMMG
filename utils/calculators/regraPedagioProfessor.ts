import { FormState, RegraResultado } from '../../types';
import { createReq } from './helper';

export const avaliarRegraPedagioProfessor = (
  data: FormState,
  idadeAnos: number,
  tempoContribDias: number,
  pedagioDias: number
): RegraResultado[] => {
  if (data.tipoServidor !== 'PEBPM') return [];

  const isHomem = data.sexo === 'Masculino';
  const metaRegenciaDias = (isHomem ? 30 : 25) * 365;
  const metaTotalComPedagio = metaRegenciaDias + pedagioDias;

  // Parâmetros de Idade e Regência
  const idadeMinima = isHomem ? 55 : 50;
  const regenciaMinima = isHomem ? 30 : 25;

  // Verificações Booleanas
  const cumpreIdade = idadeAnos >= idadeMinima;
  const cumpreRegencia = data.TempoDeRegência >= regenciaMinima;
  const cumprePedagio = tempoContribDias >= metaTotalComPedagio;
  const cumpreComum = cumpreIdade && cumpreRegencia && cumprePedagio;

  // Requisitos Reutilizáveis
  const reqIdade = createReq("Idade", idadeMinima, idadeAnos, cumpreIdade);
  const reqPedagio = createReq("Pedágio (50%)", `${pedagioDias} d`, `${Math.max(0, tempoContribDias - metaRegenciaDias)} d`, cumprePedagio);

  const regras: RegraResultado[] = [];

  regras.push({
    nome: "Regra 3 - Pedágio Professor (Integral)",
    descricao: "Exclusivo PEBPM. Ingresso até 2003. Pedágio 50%. Redução de 5 anos na idade/tempo.",
    cumpre: data.ingressouAte2003 && cumpreComum,
    requisitos: [
      reqIdade,
      createReq("Regência", regenciaMinima, data.TempoDeRegência, cumpreRegencia),
      reqPedagio
    ]
  });

  regras.push({
    nome: "Regra 4 - Pedágio Professor (Média)",
    descricao: "Exclusivo PEBPM. Ingresso 2004-2020. Pedágio 50%. Cálculo pela média.",
    cumpre: data.ingressouEntre2003e2020 && cumpreComum,
    requisitos: [
      createReq("Ingresso 2004-2020", "Sim", data.ingressouEntre2003e2020 ? "Sim" : "Não", data.ingressouEntre2003e2020),
      reqIdade,
      reqPedagio
    ]
  });

  return regras;
};