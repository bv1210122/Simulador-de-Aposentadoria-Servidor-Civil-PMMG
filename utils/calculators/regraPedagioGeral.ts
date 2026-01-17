
import { FormState, RegraResultado } from '../../types';
import { createReq } from './helper';

export const avaliarRegraPedagioGeral = (
  data: FormState, 
  idadeAnos: number, 
  tempoContribDias: number, 
  metaOriginalDias: number, 
  pedagioDias: number
): RegraResultado[] => {
  const isHomem = data.sexo === 'Masculino';
  const metaTotalComPedagio = metaOriginalDias + pedagioDias;
  
  const idadeMinima = isHomem ? 60 : 55;
  const cumpreIdade = idadeAnos >= idadeMinima;
  const cumprePedagio = tempoContribDias >= metaTotalComPedagio;
  const cumpreTempoBase = tempoContribDias >= metaOriginalDias;

  const cumpreGeral = cumpreIdade && cumpreTempoBase && cumprePedagio;

  const buildRequisitos = () => [
    createReq("Idade", idadeMinima, idadeAnos, cumpreIdade),
    createReq("Tempo Base", `${metaOriginalDias} d`, `${tempoContribDias} d`, cumpreTempoBase),
    createReq("Pedágio (50%)", `${pedagioDias} d`, `${Math.max(0, tempoContribDias - metaOriginalDias)} d`, cumprePedagio)
  ];

  return [
    {
      nome: "Regra 1 - Pedágio Geral (Integral)",
      descricao: "Ingresso até 31/12/2003. Pedágio de 50%. Direito a Integralidade e Paridade.",
      cumpre: data.ingressouAte2003 && cumpreGeral,
      requisitos: [
        createReq("Ingresso até 2003", "Sim", data.ingressouAte2003 ? "Sim" : "Não", data.ingressouAte2003),
        ...buildRequisitos()
      ]
    },
    {
      nome: "Regra 2 - Pedágio Geral (Média)",
      descricao: "Ingresso entre 01/01/2004 e 15/09/2020. Pedágio de 50%. Cálculo pela média.",
      cumpre: data.ingressouEntre2003e2020 && cumpreGeral,
      requisitos: [
        createReq("Ingresso 2004-2020", "Sim", data.ingressouEntre2003e2020 ? "Sim" : "Não", data.ingressouEntre2003e2020),
        ...buildRequisitos()
      ]
    }
  ];
};
