import { parseISO } from '../calculoDatas';

/**
 * LÓGICA DE PONTUAÇÃO PMMG:
 * A pontuação é a soma da idade (em dias) com o tempo de contribuição (em dias).
 * O resultado final é expresso em anos inteiros (divisão por 365).
 */

export const calcularPontuacao = (idadeDias: number, tempoContribDias: number) => {
  const pontuacaoTotalDias = idadeDias + tempoContribDias;
  const pontuacaoInteira = Math.floor(pontuacaoTotalDias / 365);
  return { pontuacaoTotalDias, pontuacaoInteira };
};

export const getMetaPontosGeral = (sexo: string, dataSimulacao: Date): { pontos: number; label: string } => {
  const t = dataSimulacao.getTime();
  
  if (sexo === 'Masculino') {
    const thresholds = [
      { date: '2031-01-01', pts: 105, label: "a contar de 01/01/2031" },
      { date: '2029-10-01', pts: 104, label: "a contar de 01/10/2029" },
      { date: '2028-07-01', pts: 103, label: "a contar de 01/07/2028" },
      { date: '2027-04-01', pts: 102, label: "a contar de 01/04/2027" },
      { date: '2026-01-01', pts: 101, label: "a contar de 01/01/2026" },
      { date: '2024-10-01', pts: 100, label: "a contar de 01/10/2024" },
      { date: '2023-07-01', pts: 99, label: "a contar de 01/07/2023" },
      { date: '2022-04-01', pts: 98, label: "a contar de 01/04/2022" },
      { date: '0000-01-01', pts: 97, label: "exigidos até 31/03/2022" }
    ];
    const match = thresholds.find(th => th.date === '0000-01-01' || t >= parseISO(th.date).getTime())!;
    return { pontos: match.pts, label: `Pontos ${match.label}` };
  } else {
    const thresholds = [
      { date: '2038-07-01', pts: 100, label: "a contar de 01/07/2038" },
      { date: '2037-04-01', pts: 99, label: "a contar de 01/04/2037" },
      { date: '2036-01-01', pts: 98, label: "a contar de 01/01/2036" },
      { date: '2034-10-01', pts: 97, label: "a contar de 01/10/2034" },
      { date: '2033-07-01', pts: 96, label: "a contar de 01/07/2033" },
      { date: '2032-04-01', pts: 95, label: "a contar de 01/04/2032" },
      { date: '2031-01-01', pts: 94, label: "a contar de 01/01/2031" },
      { date: '2029-10-01', pts: 93, label: "a contar de 01/10/2029" },
      { date: '2028-07-01', pts: 92, label: "a contar de 01/07/2028" },
      { date: '2027-04-01', pts: 91, label: "a contar de 01/04/2027" },
      { date: '2026-01-01', pts: 90, label: "a contar de 01/01/2026" },
      { date: '2024-10-01', pts: 89, label: "a contar de 01/10/2024" },
      { date: '2023-07-01', pts: 88, label: "a contar de 01/07/2023" },
      { date: '2022-04-01', pts: 87, label: "a contar de 01/04/2022" },
      { date: '0000-01-01', pts: 86, label: "exigidos até 31/03/2022" }
    ];
    const match = thresholds.find(th => th.date === '0000-01-01' || t >= parseISO(th.date).getTime())!;
    return { pontos: match.pts, label: `Pontos ${match.label}` };
  }
};

export const getMetaPontosProfessor = (sexo: string, dataSimulacao: Date): { pontos: number; label: string } => {
  const t = dataSimulacao.getTime();
  
  if (sexo === 'Masculino') {
    const thresholds = [
      { date: '2029-01-01', pts: 100, label: "a contar de 01/01/2029" },
      { date: '2028-01-01', pts: 99, label: "a contar de 01/01/2028" },
      { date: '2027-01-01', pts: 98, label: "a contar de 01/01/2027" },
      { date: '2026-01-01', pts: 97, label: "a contar de 01/01/2026" },
      { date: '2025-01-01', pts: 96, label: "a contar de 01/01/2025" },
      { date: '2024-01-01', pts: 95, label: "a contar de 01/01/2024" },
      { date: '2023-01-01', pts: 94, label: "a contar de 01/01/2023" },
      { date: '2022-01-01', pts: 93, label: "a contar de 01/01/2022" },
      { date: '0000-01-01', pts: 92, label: "exigidos até 31/12/2021" }
    ];
    const match = thresholds.find(th => th.date === '0000-01-01' || t >= parseISO(th.date).getTime())!;
    return { pontos: match.pts, label: `Pontos ${match.label}` };
  } else {
    const thresholds = [
      { date: '2032-01-01', pts: 92, label: "a contar de 01/01/2032" },
      { date: '2031-01-01', pts: 91, label: "a contar de 01/01/2031" },
      { date: '2030-01-01', pts: 90, label: "a contar de 01/01/2030" },
      { date: '2029-01-01', pts: 89, label: "a contar de 01/01/2029" },
      { date: '2028-01-01', pts: 88, label: "a contar de 01/01/2028" },
      { date: '2027-01-01', pts: 87, label: "a contar de 01/01/2027" },
      { date: '2026-01-01', pts: 86, label: "a contar de 01/01/2026" },
      { date: '2025-01-01', pts: 85, label: "a contar de 01/01/2025" },
      { date: '2024-01-01', pts: 84, label: "a contar de 01/01/2024" },
      { date: '2023-01-01', pts: 83, label: "a contar de 01/01/2023" },
      { date: '2022-01-01', pts: 82, label: "a contar de 01/01/2022" },
      { date: '0000-01-01', pts: 81, label: "exigidos até 31/12/2021" }
    ];
    const match = thresholds.find(th => th.date === '0000-01-01' || t >= parseISO(th.date).getTime())!;
    return { pontos: match.pts, label: `Pontos ${match.label}` };
  }
};
