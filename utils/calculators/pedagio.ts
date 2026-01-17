
import { diffInDays } from '../dateHelpers';

export const calcularPedagio50 = (dataInclusao: Date, metaDias: number): { 
  tempoNoCorte: number; 
  saldoNoCorte: number; 
  pedagio: number; 
} => {
  const dCorte = new Date('2020-09-15T00:00:00');
  const tempoNoCorte = dataInclusao <= dCorte ? diffInDays(dataInclusao, dCorte) : 0;
  const saldoNoCorte = Math.max(0, metaDias - tempoNoCorte);
  const pedagio = Math.ceil(saldoNoCorte * 0.5);

  return { tempoNoCorte, saldoNoCorte, pedagio };
};
