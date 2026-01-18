
/**
 * Utilitários de Data específicos para a lógica da PMMG.
 * Importante: Todas as funções operam em UTC para evitar distorções de fuso horário
 * que podem causar erros de +/- 1 dia no cálculo.
 */

/**
 * Converte uma string ISO (AAAA-MM-DD) para um objeto Date no início do dia UTC.
 */
export const parseISO = (dateStr: string) => new Date(dateStr + 'T00:00:00Z');

/**
 * Calcula a diferença absoluta em dias entre duas datas de forma inclusiva.
 * A regra da PMMG exige que se o período é de 01/01 a 01/01, conte-se 1 dia.
 */
export const diffInDays = (d1: Date, d2: Date): number => {
  const utc1 = Date.UTC(d1.getUTCFullYear(), d1.getUTCMonth(), d1.getUTCDate());
  const utc2 = Date.UTC(d2.getUTCFullYear(), d2.getUTCMonth(), d2.getUTCDate());
  
  if (utc1 > utc2) return 0;
  
  const diffTime = utc2 - utc1;
  // A divisão por milissegundos dá o intervalo. O +1 torna o cálculo inclusivo (conta o dia de início e fim).
  return Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
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
 * LÓGICA OFICIAL PMMG PARA APURAÇÃO DE TEMPO:
 * Diferente do cálculo civil comum, a PMMG apura anos completos multiplicando por 365
 * e soma os dias residuais que sobraram após o último aniversário.
 * 
 * Exemplo: 1 ano e 2 dias = (1 * 365) + 2 = 367 dias totais.
 */
export const calculatePMMGPeriod = (start: Date, end: Date): { totalDias: number; anos: number; diasResiduais: number; formatada: string } => {
  const diaInic = start.getUTCDate();
  const mesInic = start.getUTCMonth();
  
  let anoUltimoAniv = end.getUTCFullYear();
  let dataUltimoAniv = new Date(Date.UTC(anoUltimoAniv, mesInic, diaInic));

  // Ajusta o aniversário: se no ano atual a data ainda não chegou, o último aniversário foi no ano passado
  if (dataUltimoAniv > end) {
    anoUltimoAniv--;
    dataUltimoAniv = new Date(Date.UTC(anoUltimoAniv, mesInic, diaInic));
  }

  const anosCompletos = anoUltimoAniv - start.getUTCFullYear();
  const diasBaseAnos = anosCompletos * 365;
  
  let diasResiduais = 0;
  if (end.getTime() > dataUltimoAniv.getTime()) {
    // Dias residuais: contagem inclusiva do dia seguinte ao aniversário até a data final
    const diaPosterior = addDays(dataUltimoAniv, 1);
    diasResiduais = diffInDays(diaPosterior, end);
  }

  const totalDias = diasBaseAnos + diasResiduais;
  
  return {
    totalDias,
    anos: anosCompletos,
    diasResiduais,
    formatada: `${anosCompletos} anos e ${diasResiduais} dias`
  };
};

/**
 * Atalho para calcular a idade exata seguindo a aritmética PMMG.
 */
export const calculateAgeDaysSpecific = (nascimento: Date, simulacao: Date) => {
  return calculatePMMGPeriod(nascimento, simulacao);
};

/**
 * Converte um total de dias de volta para o formato legível "X anos e Y dias"
 * assumindo o ano padrão de 365 dias (regra PMMG).
 */
export const formatDaysToYMD = (totalDays: number): string => {
  const years = Math.floor(totalDays / 365);
  const remainingDays = totalDays % 365;
  return `${years} anos e ${remainingDays} dias`;
};
