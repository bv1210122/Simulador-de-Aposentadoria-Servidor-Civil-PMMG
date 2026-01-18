
import { diffInDays, calculatePMMGPeriod } from '../calculoDatas';

/**
 * Lógica de Pedágio PMMG (EC 104/2020)
 * Conforme raciocínio oficial:
 * 1. O ingresso deve ser até 15/09/2020.
 * 2. Tempos averbados são necessariamente anteriores à inclusão (sem concomitância), 
 *    logo, são sempre anteriores a 15/09/2020.
 * 3. A fórmula do tempo no corte é: (Tempo PMMG em 15/09/2020) + (Total Averbado) - (Descontos até 15/09/2020).
 */

export interface PedagioResultado {
  tempoNoCorte: number;
  saldoNoCorte: number;
  pedagio: number;
}

/**
 * Calcula o pedágio de 50% sobre o tempo faltante na data da reforma.
 * @param dataInclusao Data de ingresso no cargo efetivo.
 * @param totalAverbadoDias Total de dias averbados (sempre considerados anteriores à reforma).
 * @param descontosAnterioresDias Total de dias de desconto ocorridos até 15/09/2020.
 * @param metaDias Meta de tempo total exigida (ex: 30 ou 35 anos em dias).
 */
export const calcularPedagio50 = (
  dataInclusao: Date,
  totalAverbadoDias: number,
  descontosAnterioresDias: number,
  metaDias: number
): PedagioResultado => {
  const dataCorte = new Date('2020-09-15T00:00:00Z');
  
  // Se ingressou após a reforma, não entra nesta regra de transição
  if (dataInclusao > dataCorte) {
    return { tempoNoCorte: 0, saldoNoCorte: metaDias, pedagio: Math.ceil(metaDias * 0.5) };
  }

  // 1. Cálculo do Tempo PMMG até a data do corte (15/09/2020)
  // Seguindo a aritmética PMMG: anos completos * 365 + dias residuais
  const pmmgNoCorte = calculatePMMGPeriod(dataInclusao, dataCorte);
  
  // 2. Aplicação da Fórmula: Tempo15092020 = TempoPMMG + TotalAverbado - DescontosNoPeriodo
  const tempoNoCorte = pmmgNoCorte.totalDias + totalAverbadoDias - descontosAnterioresDias;
  
  // 3. Saldo Faltante e Pedágio
  const saldoNoCorte = Math.max(0, metaDias - tempoNoCorte);
  const pedagio = Math.ceil(saldoNoCorte * 0.5);

  return { 
    tempoNoCorte, 
    saldoNoCorte, 
    pedagio 
  };
};
