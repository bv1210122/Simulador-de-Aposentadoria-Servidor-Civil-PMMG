import { diffInDays, addDays } from '../calculoDatas';

export interface IdadePMMGResultado {
  totalDias: number;
  anos: number;
  diasResiduais: number;
  formatada: string;
}

/**
 * LÓGICA DE IDADE (REGRA SEPLAG):
 * Determina-se a idade total em anos considerando as datas de aniversário e 
 * calcula-se a diferença em dias da última data de aniversário para a data da simulação.
 * 
 * Fórmula: IdadeServidor = ((AnoUltimoAniversário - AnoNascimento)*365) + (DataSimulação - DataDiaPosteriorÚltimoAniversário)
 */
export const calculateIdadePMMG = (nascimento: Date, simulacao: Date): IdadePMMGResultado => {
  const diaNasc = nascimento.getUTCDate();
  const mesNasc = nascimento.getUTCMonth();
  
  let anoUltimoAniv = simulacao.getUTCFullYear();
  let dataUltimoAniv = new Date(Date.UTC(anoUltimoAniv, mesNasc, diaNasc));

  // Ajusta o aniversário: se no ano atual a data ainda não chegou, o último aniversário foi no ano passado
  if (dataUltimoAniv > simulacao) {
    anoUltimoAniv--;
    dataUltimoAniv = new Date(Date.UTC(anoUltimoAniv, mesNasc, diaNasc));
  }

  const anosCompletos = anoUltimoAniv - nascimento.getUTCFullYear();
  const diasBaseAnos = anosCompletos * 365;
  
  let diasResiduais = 0;
  if (simulacao.getTime() > dataUltimoAniv.getTime()) {
    // Dias residuais SEPLAG: do dia posterior ao aniversário até a data da prévia.
    // Para ser inclusivo (como no exemplo 14/02 a 05/12 = 295 dias), usamos diffInDays + 1.
    const diaPosterior = addDays(dataUltimoAniv, 1);
    diasResiduais = diffInDays(diaPosterior, simulacao) + 1;
  } else if (simulacao.getTime() === dataUltimoAniv.getTime()) {
    // Exatamente no dia do aniversário
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