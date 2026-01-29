/**
 * Utilitários de Data genéricos.
 * Importante: Todas as funções operam em UTC para evitar distorções de fuso horário.
 */

/**
 * Converte uma string ISO (AAAA-MM-DD) para um objeto Date no início do dia UTC.
 */
export const parseISO = (dateStr: string) => new Date(dateStr + 'T00:00:00Z');

/**
 * Calcula a diferença absoluta em dias entre duas datas (Duração real).
 * Conforme pedido, para o tempo bruto: 01/01/2015 a 28/01/2026 deve resultar em 4.045 dias.
 * (Calculado como Date2 - Date1).
 */
export const diffInDays = (d1: Date, d2: Date): number => {
  const utc1 = Date.UTC(d1.getUTCFullYear(), d1.getUTCMonth(), d1.getUTCDate());
  const utc2 = Date.UTC(d2.getUTCFullYear(), d2.getUTCMonth(), d2.getUTCDate());
  
  if (utc1 > utc2) return 0;
  
  const diffTime = utc2 - utc1;
  // Retorna a diferença exata em dias (sem o +1 inclusivo anterior)
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Adiciona uma quantidade específica de dias a uma data, mantendo a integridade UTC.
 */
export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
};

/**
 * Formata uma data para o padrão brasileiro (DD/MM/AAAA) usando componentes UTC.
 */
export const formatDateBR = (date: Date): string => {
  const d = date.getUTCDate().toString().padStart(2, '0');
  const m = (date.getUTCMonth() + 1).toString().padStart(2, '0');
  const y = date.getUTCFullYear();
  return `${d}/${m}/${y}`;
};

/**
 * Converte um total de dias para o formato legível "X anos e Y dias"
 * assumindo o ano padrão de 365 dias para fins de exibição genérica.
 */
export const formatDaysToYMD = (totalDays: number): string => {
  const years = Math.floor(totalDays / 365);
  const remainingDays = totalDays % 365;
  return `${years} anos e ${remainingDays} dias`;
};

/**
 * Calcula o período civil exato (Anos de calendário + Dias restantes).
 * Usado para o Tempo PMMG (Bruto).
 */
export const calculateCalendarPeriod = (start: Date, end: Date) => {
  const dStart = start.getUTCDate();
  const mStart = start.getUTCMonth();
  
  let anoFim = end.getUTCFullYear();
  let dataAnivFim = new Date(Date.UTC(anoFim, mStart, dStart));

  if (dataAnivFim > end) {
    anoFim--;
    dataAnivFim = new Date(Date.UTC(anoFim, mStart, dStart));
  }

  const anos = anoFim - start.getUTCFullYear();
  const dias = diffInDays(dataAnivFim, end);

  return {
    anos,
    dias,
    formatada: `${anos} anos e ${dias} dias`
  };
};

/**
 * Mantida para compatibilidade com SEPLAG se necessário.
 */
export const calculatePMMGPeriod = (start: Date, end: Date) => {
  return calculateCalendarPeriod(start, end);
};