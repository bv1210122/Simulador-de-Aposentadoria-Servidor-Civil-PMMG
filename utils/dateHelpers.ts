
export const parseISO = (dateStr: string) => new Date(dateStr + 'T00:00:00');

export const diffInDays = (d1: Date, d2: Date): number => {
  // Converte para UTC para evitar problemas com fuso horário e horário de verão
  const utc1 = Date.UTC(d1.getFullYear(), d1.getMonth(), d1.getDate());
  const utc2 = Date.UTC(d2.getFullYear(), d2.getMonth(), d2.getDate());
  
  const diffTime = Math.abs(utc2 - utc1);
  return Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1; // Contagem inclusiva conforme regra
};

export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const formatDateBR = (date: Date): string => {
  return date.toLocaleDateString('pt-BR');
};

/**
 * Calcula a idade em dias conforme a regra específica solicitada:
 * 1. Identifica os anos completos do nascimento até o último aniversário antes da simulação.
 * 2. Calcula os dias do dia seguinte ao aniversário até a data da simulação (inclusivo).
 * 3. Total em dias = (Anos Completos * 365) + Dias Extras.
 */
export const calculateAgeDaysSpecific = (nascimento: Date, simulacao: Date): { totalDias: number; formatada: string } => {
  const diaNasc = nascimento.getDate();
  const mesNasc = nascimento.getMonth();
  
  let anoAniversario = simulacao.getFullYear();
  let dataUltimoAniversario = new Date(anoAniversario, mesNasc, diaNasc);

  // Se o aniversário deste ano ainda não aconteceu, retrocede um ano
  if (dataUltimoAniversario > simulacao) {
    anoAniversario--;
    dataUltimoAniversario = new Date(anoAniversario, mesNasc, diaNasc);
  }

  const anosCompletos = anoAniversario - nascimento.getFullYear();
  
  let diasExtras = 0;
  if (dataUltimoAniversario.getTime() < simulacao.getTime()) {
    // Regra: contar a partir do dia posterior ao último aniversário
    const diaPosteriorAoAniversario = addDays(dataUltimoAniversario, 1);
    diasExtras = diffInDays(diaPosteriorAoAniversario, simulacao);
  } else if (dataUltimoAniversario.getTime() === simulacao.getTime()) {
    // Se a simulação for exatamente no dia do aniversário, os dias extras são zero
    diasExtras = 0;
  }

  const totalDias = (anosCompletos * 365) + diasExtras;
  
  return {
    totalDias,
    formatada: `${anosCompletos} anos e ${diasExtras} dias`
  };
};

export const formatDaysToYMD = (totalDays: number): string => {
  const years = Math.floor(totalDays / 365);
  const remainingDays = totalDays % 365;
  return `${years} anos e ${remainingDays} dias`;
};
