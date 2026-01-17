
import { Requisito } from '../../types';

/**
 * Cria um objeto de requisito padronizado para evitar repetição de lógica booleana simples
 */
export const createReq = (label: string, esperado: string | number, atual: string | number, cumpre: boolean): Requisito => ({
  label,
  esperado: String(esperado),
  atual: String(atual),
  cumpre
});
