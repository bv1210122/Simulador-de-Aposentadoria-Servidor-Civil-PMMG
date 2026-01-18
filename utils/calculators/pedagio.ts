
import { diffInDays, parseISO } from '../calculoDatas';

export const calcularPedagio50 = (dataInclusao: Date, metaDias: number): { 
  tempoNoCorte: number; 
  saldoNoCorte: number; 
  pedagio: number; 
} => {
  // Garantir que a data de corte seja interpretada como UTC
  const dCorte = parseISO('2020-09-15');
  const tempoNoCorte = dataInclusao <= dCorte ? diffInDays(dataInclusao, dCorte) : 0;
  const saldoNoCorte = Math.max(0, metaDias - tempoNoCorte);
  const pedagio = Math.ceil(saldoNoCorte * 0.5);

  return { tempoNoCorte, saldoNoCorte, pedagio };
};
