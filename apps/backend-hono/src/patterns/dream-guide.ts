/**
 * Guía de los sueños (diccionario onírico tradicional hondureño).
 * Mapea un símbolo soñado a su número asociado en el imaginario popular.
 *
 * Fuente cultural; ampliable. Usado por el motor para cruzar tendencias de
 * búsqueda/sueños con la estadística (meta-patrones psico-estadísticos).
 */
export const DREAM_GUIDE: Record<string, number> = {
  fuego: 24,
  dinero: 8,
  agua: 12,
  muerte: 47,
  perro: 19,
  gato: 5,
  serpiente: 14,
  nino: 1,
  casa: 4,
  sangre: 18,
  amor: 33,
  carro: 40,
  avion: 71,
  santo: 99,
  diablo: 66,
};

/** Devuelve el número asociado a un símbolo soñado, o null si no existe. */
export function numberForDream(symbol: string): number | null {
  return DREAM_GUIDE[symbol.trim().toLowerCase()] ?? null;
}
