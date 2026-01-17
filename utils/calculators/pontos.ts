
import { parseISO } from '../dateHelpers';

export const getMetaPontosGeral = (sexo: string, dataSimulacao: Date): { pontos: number; label: string } => {
  const t = dataSimulacao.getTime();
  if (sexo === 'Masculino') {
    if (t < parseISO('2022-04-01').getTime()) return { pontos: 97, label: "97 pts (até 31/03/22)" };
    if (t < parseISO('2023-07-01').getTime()) return { pontos: 98, label: "98 pts (01/04/22 a 30/06/23)" };
    if (t < parseISO('2024-10-01').getTime()) return { pontos: 99, label: "99 pts (01/07/23 a 30/09/24)" };
    return { pontos: 100, label: "100 pts (Desde 01/10/24)" };
  } else {
    if (t < parseISO('2022-04-01').getTime()) return { pontos: 86, label: "86 pts (até 31/03/22)" };
    if (t < parseISO('2023-07-01').getTime()) return { pontos: 87, label: "87 pts (01/04/22 a 30/06/23)" };
    if (t < parseISO('2024-10-01').getTime()) return { pontos: 88, label: "88 pts (01/07/23 a 30/09/24)" };
    return { pontos: 89, label: "89 pts (Desde 01/10/24)" };
  }
};

export const getMetaPontosProfessor = (sexo: string, dataSimulacao: Date): { pontos: number; label: string } => {
  const currentYear = dataSimulacao.getFullYear();
  const idx = Math.max(0, currentYear - 2021);
  
  const ptsM = [92, 93, 94, 95, 96, 97, 98, 99, 100]; // Limita em 100
  const ptsF = [81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92]; // Limita em 92

  if (sexo === 'Masculino') {
    const val = ptsM[Math.min(idx, ptsM.length - 1)];
    return { pontos: val, label: `${val} pontos (em ${currentYear})` };
  } else {
    const val = ptsF[Math.min(idx, ptsF.length - 1)];
    return { pontos: val, label: `${val} pontos (em ${currentYear})` };
  }
};
