
export const parseISO = (dateStr: string) => new Date(dateStr + 'T00:00:00Z');

export const diffInDays = (d1: Date, d2: Date): number => {
  const utc1 = Date.UTC(d1.getUTCFullYear(), d1.getUTCMonth(), d1.getUTCDate());
  const utc2 = Date.UTC(d2.getUTCFullYear(), d2.getUTCMonth(), d2.getUTCDate());
  
  if (utc1 > utc2) return 0;
  
  const diffTime = utc2 - utc1;
  // +1 para tornar a contagem inclusiva (ex: de 02/12 a 02/12 = 1 dia)
  return Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
};

export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
};

export const formatDateBR = (date: Date): string => {
  const d = date.getUTCDate().toString().padStart(2, '0');
  const m = (date.getUTCMonth() + 1).toString().padStart(2, '0');
  const y = date.getUTCFullYear();
  return `${d}/${m}/${y}`;
};

/**
 * Lógica Oficial PMMG:
 * 1. Calcula anos completos até o último aniversário.
 * 2. Calcula dias residuais do DIA POSTERIOR ao último aniversário até a DATA FINAL (inclusivo).
 * 3. Total em dias = (Anos * 365) + Dias Residuais.
 */
export const calculatePMMGPeriod = (start: Date, end: Date): { totalDias: number; anos: number; diasResiduais: number; formatada: string } => {
  const diaInic = start.getUTCDate();
  const mesInic = start.getUTCMonth();
  
  let anoUltimoAniv = end.getUTCFullYear();
  let dataUltimoAniv = new Date(Date.UTC(anoUltimoAniv, mesInic, diaInic));

  // Se o aniversário deste ano ainda não aconteceu, volta para o ano anterior
  if (dataUltimoAniv > end) {
    anoUltimoAniv--;
    dataUltimoAniv = new Date(Date.UTC(anoUltimoAniv, mesInic, diaInic));
  }

  const anosCompletos = anoUltimoAniv - start.getUTCFullYear();
  const diasBaseAnos = anosCompletos * 365;
  
  let diasResiduais = 0;
  if (end.getTime() > dataUltimoAniv.getTime()) {
    // A regra exige contar do dia posterior ao aniversário até a data final, inclusive.
    const diaPosterior = addDays(dataUltimoAniv, 1);
    diasResiduais = diffInDays(diaPosterior, end);
  } else {
    // Se a data final é o próprio aniversário, os dias residuais são 0.
    diasResiduais = 0;
  }

  const totalDias = diasBaseAnos + diasResiduais;
  
  return {
    totalDias,
    anos: anosCompletos,
    diasResiduais,
    formatada: `${anosCompletos} anos e ${diasResiduais} dias`
  };
};

export const calculateAgeDaysSpecific = (nascimento: Date, simulacao: Date) => {
  return calculatePMMGPeriod(nascimento, simulacao);
};

export const formatDaysToYMD = (totalDays: number): string => {
  const years = Math.floor(totalDays / 365);
  const remainingDays = totalDays % 365;
  return `${years} anos e ${remainingDays} dias`;
};
