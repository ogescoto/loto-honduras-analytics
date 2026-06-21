/**
 * Motor de cálculo de patrones (lógica pura, sin I/O — testeable).
 *
 * Nivel 1: estadística sobre el histórico de sorteos.
 *   - Fríos/calientes por ventana temporal (frecuencia de aparición).
 *   - Rachas inversas (números con más tiempo sin salir).
 *   - Par/impar (distribución estructural).
 * Nivel 2: meta-patrones (cruce de números calientes con sueños/búsquedas).
 */

export interface DrawRecord {
  drawNumber: number;
  winningNumbers: number[];
  drawTimestamp: Date;
}

export interface FrequencyResult {
  number: number;
  count: number;
}

export interface HotColdResult {
  windowDays: number;
  hot: FrequencyResult[];
  cold: FrequencyResult[];
}

/** Filtra sorteos dentro de una ventana de N días hacia atrás desde `now`. */
export function withinWindow(
  draws: DrawRecord[],
  windowDays: number,
  now: Date = new Date(),
): DrawRecord[] {
  const cutoff = now.getTime() - windowDays * 24 * 60 * 60 * 1000;
  return draws.filter((d) => d.drawTimestamp.getTime() >= cutoff);
}

/** Cuenta apariciones de cada número en los sorteos dados. */
export function frequency(draws: DrawRecord[]): Map<number, number> {
  const counts = new Map<number, number>();
  for (const d of draws) {
    for (const n of d.winningNumbers) {
      counts.set(n, (counts.get(n) ?? 0) + 1);
    }
  }
  return counts;
}

/** Top `limit` números más calientes y más fríos en la ventana. */
export function hotCold(
  draws: DrawRecord[],
  windowDays: number,
  limit = 5,
  now: Date = new Date(),
): HotColdResult {
  const inWindow = withinWindow(draws, windowDays, now);
  const counts = [...frequency(inWindow).entries()]
    .map(([number, count]) => ({ number, count }))
    .sort((a, b) => b.count - a.count);
  return {
    windowDays,
    hot: counts.slice(0, limit),
    cold: counts.slice(-limit).reverse(),
  };
}

export interface InverseStreakResult {
  number: number;
  drawsSinceLastSeen: number;
}

/**
 * Rachas inversas: para el universo de números [0..maxNumber], cuántos sorteos
 * han pasado desde la última vez que cada número apareció. Mayor = más "atrasado".
 */
export function inverseStreaks(
  draws: DrawRecord[],
  maxNumber: number,
  limit = 5,
): InverseStreakResult[] {
  const ordered = [...draws].sort(
    (a, b) => b.drawTimestamp.getTime() - a.drawTimestamp.getTime(),
  );
  const result: InverseStreakResult[] = [];
  for (let n = 0; n <= maxNumber; n++) {
    let since = ordered.length; // si nunca salió, racha = total de sorteos
    for (let i = 0; i < ordered.length; i++) {
      if (ordered[i]!.winningNumbers.includes(n)) {
        since = i;
        break;
      }
    }
    result.push({ number: n, drawsSinceLastSeen: since });
  }
  return result
    .sort((a, b) => b.drawsSinceLastSeen - a.drawsSinceLastSeen)
    .slice(0, limit);
}

export interface ParityResult {
  even: number;
  odd: number;
  evenRatio: number;
}

/** Distribución par/impar sobre todos los números ganadores. */
export function parity(draws: DrawRecord[]): ParityResult {
  let even = 0;
  let odd = 0;
  for (const d of draws) {
    for (const n of d.winningNumbers) {
      if (n % 2 === 0) even++;
      else odd++;
    }
  }
  const total = even + odd;
  return { even, odd, evenRatio: total === 0 ? 0 : even / total };
}

export interface MetaPatternCandidate {
  targetNumbers: number[];
  description: string;
  confidenceScore: string;
}

/**
 * Cruce psico-estadístico: si un número está caliente Y coincide con un
 * número de la guía de sueños cuya temática está en tendencia, se eleva a
 * meta-patrón. `dreamNumbers` son los números derivados de sueños/búsquedas
 * en tendencia.
 */
export function crossMetaPatterns(
  hot: FrequencyResult[],
  dreamNumbers: number[],
): MetaPatternCandidate[] {
  const hotSet = new Map(hot.map((h) => [h.number, h.count]));
  const maxCount = hot.length ? Math.max(...hot.map((h) => h.count)) : 0;
  const out: MetaPatternCandidate[] = [];

  for (const dn of new Set(dreamNumbers)) {
    if (hotSet.has(dn)) {
      const count = hotSet.get(dn)!;
      const confidence = maxCount === 0 ? 0 : (count / maxCount) * 100;
      out.push({
        targetNumbers: [dn],
        description: `Coincidencia psico-estadística: el número ${dn} está caliente y coincide con un sueño/búsqueda en tendencia.`,
        confidenceScore: `${confidence.toFixed(1)}%`,
      });
    }
  }
  return out;
}
