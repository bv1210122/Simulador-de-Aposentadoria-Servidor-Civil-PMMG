
export const parseISO = (dateStr: string) => new Date(dateStr + 'T00:00:00');

export const diffInDays = (d1: Date, d2: Date): number => {
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Incluindo o próprio dia conforme regra
};

export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const formatDateBR = (date: Date): string => {
  return date.toLocaleDateString('pt-BR');
};

export const calculateAgeDaysSpecific = (nascimento: Date, simulacao: Date): { totalDias: number; formatada: string } => {
  const anoSimulacao = simulacao.getFullYear();
  let dataUltimoAniversario = new Date(anoSimulacao, nascimento.getMonth(), nascimento.getDate());

  if (dataUltimoAniversario > simulacao) {
    dataUltimoAniversario = new Date(anoSimulacao - 1, nascimento.getMonth(), nascimento.getDate());
  }

  const anosCompletos = dataUltimoAniversario.getFullYear() - nascimento.getFullYear();
  const diasAposAniversario = diffInDays(addDays(dataUltimoAniversario, 1), simulacao);
  
  // Se a simulação for exatamente no dia do aniversário, o diffInDays acima pode retornar 1 indevidamente ou algo assim
  // Ajuste para o dia do aniversário:
  const diasExtras = dataUltimoAniversario.getTime() === simulacao.getTime() ? 0 : diasAposAniversario;

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
