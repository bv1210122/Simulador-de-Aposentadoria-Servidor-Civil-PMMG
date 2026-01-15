
export const parseISO = (dateStr: string) => new Date(dateStr + 'T00:00:00');

export const diffInDays = (d1: Date, d2: Date): number => {
  // Converte para UTC para garantir precisão absoluta no cálculo de dias civis
  const utc1 = Date.UTC(d1.getFullYear(), d1.getMonth(), d1.getDate());
  const utc2 = Date.UTC(d2.getFullYear(), d2.getMonth(), d2.getDate());
  
  // Para tempo de serviço, se a data final for anterior à inicial, o tempo é zero
  if (utc1 > utc2) return 0;
  
  const diffTime = utc2 - utc1;
  // A soma de +1 torna a contagem INCLUSIVA (Padrão PMMG/Serviço Público)
  return Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
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
 * 1. Anos Completos * 365
 * 2. Dias residuais do dia seguinte ao último aniversário até a simulação (inclusivo)
 */
export const calculateAgeDaysSpecific = (nascimento: Date, simulacao: Date): { totalDias: number; formatada: string } => {
  const diaNasc = nascimento.getDate();
  const mesNasc = nascimento.getMonth();
  
  let anoAniversario = simulacao.getFullYear();
  let dataUltimoAniversario = new Date(anoAniversario, mesNasc, diaNasc);

  if (dataUltimoAniversario > simulacao) {
    anoAniversario--;
    dataUltimoAniversario = new Date(anoAniversario, mesNasc, diaNasc);
  }

  const anosCompletos = anoAniversario - nascimento.getFullYear();
  
  let diasExtras = 0;
  if (dataUltimoAniversario.getTime() < simulacao.getTime()) {
    const diaPosteriorAoAniversario = addDays(dataUltimoAniversario, 1);
    diasExtras = diffInDays(diaPosteriorAoAniversario, simulacao);
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
