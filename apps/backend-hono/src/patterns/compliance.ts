/**
 * Cumplimiento histórico de características (optimizado para el edge).
 *
 * Para cada sorteo de un juego, reconstruye el estado latente vigente JUSTO
 * ANTES de ese sorteo y verifica si el/los números ganadores cumplían TODAS las
 * características solicitadas. Así el usuario combina patrones y ve, en orden
 * cronológico, cuándo se han dado en el juego seleccionado.
 *
 * Optimización: NO calcula los 100 números por sorteo (eso excedía el límite de
 * CPU del Worker). Solo evalúa los ganadores con búsquedas binarias sobre
 * estructuras pre-computadas.
 */
import { ALL_FEATURES, FEATURE_LABELS, FEATURE_META, type FeatureCode } from "./features-engine.js";
import { DREAM_GUIDE } from "./dream-guide.js";

const SUEÑO_NUMBERS = new Set(Object.values(DREAM_GUIDE));

export interface Draw {
  game: string;
  sessionId: string;
  numbers: string[];
  drawDate: number; // epoch ms
}

export interface HitResult {
  drawDate: string;
  sessionId: string;
  numbers: string[];
  matchedNumbers: number[];
}

export const MAX_EVALUATED_DRAWS = 120;
export const MAX_RETURNED_HITS = 30;

const DAY = 86_400_000;

function decadeOf(n: number): number {
  return Math.floor(n / 10);
}

function dozenOf(n: number): number {
  return Math.min(Math.floor(n / 12), 7);
}

function digits(lw: number): [number, number] {
  return [Math.floor(lw / 10), lw % 10];
}

/** Índice del último elemento con ts < `value` (o -1 si no hay). */
function rightmostBefore(ts: number[], value: number): number {
  let lo = 0;
  let hi = ts.length - 1;
  let ans = -1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (ts[mid]! < value) {
      ans = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  return ans;
}

interface CtxBuilder {
  allE: { n: number; ts: number }[]; // entradas numéricas de la familia (asc)
  allT: number[];
  numTs: number[][];      // fechas (asc) por número (familia)
  numSlotTs: number[][];  // fechas (asc) por número (jornada objetivo)
  slotDraws: Draw[];      // sorteos de la jornada objetivo (asc)
}

function buildIndexes(familyDraws: Draw[], slotDraws: Draw[]): CtxBuilder {
  const allE: { n: number; ts: number }[] = [];
  const numTs: number[][] = Array.from({ length: 100 }, () => []);
  const numSlotTs: number[][] = Array.from({ length: 100 }, () => []);

  for (const d of familyDraws) {
    for (const raw of d.numbers) {
      const n = parseInt(raw, 10);
      if (!isNaN(n) && n >= 0 && n <= 99) {
        allE.push({ n, ts: d.drawDate });
        numTs[n]!.push(d.drawDate);
      }
    }
  }
  for (const d of slotDraws) {
    for (const raw of d.numbers) {
      const n = parseInt(raw, 10);
      if (!isNaN(n) && n >= 0 && n <= 99) numSlotTs[n]!.push(d.drawDate);
    }
  }

  allE.sort((a, b) => a.ts - b.ts);
  for (const arr of numTs) arr.sort((a, b) => a - b);
  for (const arr of numSlotTs) arr.sort((a, b) => a - b);

  return { allE, allT: allE.map((e) => e.ts), numTs, numSlotTs, slotDraws };
}

interface GlobalCtx {
  lastGlobalWinner: number;
  prevGlobalWinner: number;
  yesterdaySlotWinner: number;
  activeDecenas: Set<number>;
  hotTerminations: Set<number>;
  coldTerminations: Set<number>;
  activeDozen: Set<number>;
  activeSlotDecenas: Set<number>;
  prevSlotDecade: number;
  /** Fechas de los sorteos de la jornada objetivo (ascendentes). */
  slotDatesAsc: number[];
  /** Números de la guía de los sueños (imaginario popular). */
  suenoNumbers: Set<number>;
  /** Terminaciones (dígito 0-9) de los últimos 100 sorteos de la jornada. */
  term100: number[];
  /** Decenas de los últimos 100 sorteos de la jornada. */
  decena100: number[];
}

function buildGlobalCtx(b: CtxBuilder, now: number): GlobalCtx {
  const idx = rightmostBefore(b.allT, now);
  const lw = idx >= 0 ? b.allE[idx]!.n : -1;
  const prevWinner = idx >= 1 ? b.allE[idx - 1]!.n : -1;

  // Último ganador de la jornada objetivo con fecha "ayer" (±1 día).
  const yesterday = now - DAY;
  let yesterdaySlotWinner = -1;
  let bestTs = -Infinity;
  for (let n = 0; n < 100; n++) {
    const arr = b.numSlotTs[n]!;
    const last = rightmostBefore(arr, now);
    if (last >= 0) {
      const ts = arr[last]!;
      if (Math.abs(ts - yesterday) <= DAY && ts > bestTs) {
        bestTs = ts;
        yesterdaySlotWinner = n;
      }
    }
  }

  // Clúster de decena activa: decenas con más salidas en [now-3d, now).
  const threeDaysAgo = now - 3 * DAY;
  const decenaCounts = new Array(10).fill(0);
  for (let i = 0; i < b.allT.length && b.allT[i]! < now; i++) {
    if (b.allT[i]! >= threeDaysAgo) decenaCounts[decadeOf(b.allE[i]!.n)]!++;
  }
  const maxDecena = Math.max(...decenaCounts);
  const activeDecenas = new Set<number>();
  decenaCounts.forEach((c, i) => {
    if (c === maxDecena && c > 0) activeDecenas.add(i);
  });

  // Terminaciones caliente/fría sobre las últimas 15 jugadas de la familia.
  const startTerm = Math.max(0, idx - 14);
  const termCounts = new Array(10).fill(0);
  for (let i = startTerm; i <= idx; i++) termCounts[b.allE[i]!.n % 10]!++;
  const maxTerm = Math.max(...termCounts);
  const minTerm = Math.min(...termCounts.filter((c) => c > 0));
  const hotTerminations = new Set<number>();
  const coldTerminations = new Set<number>();
  termCounts.forEach((c, i) => {
    if (c === maxTerm && c > 0) hotTerminations.add(i);
    if (c === minTerm && c > 0) coldTerminations.add(i);
  });

  // Docena activa: docena con más salidas en las últimas 30 jugadas de la familia.
  const startDozen = Math.max(0, idx - 29);
  const dozenCounts = new Array(8).fill(0);
  for (let i = startDozen; i <= idx; i++) dozenCounts[dozenOf(b.allE[i]!.n)]!++;
  const maxDozen = Math.max(...dozenCounts);
  const activeDozen = new Set<number>();
  dozenCounts.forEach((c, i) => {
    if (c === maxDozen && c > 0) activeDozen.add(i);
  });

  // Contexto de la jornada objetivo: sorteos anteriores a `now`.
  const pastSlotIdx = rightmostBefore(b.slotDraws.map((d) => d.drawDate), now);
  const slotTokens: number[] = [];
  for (let i = Math.max(0, pastSlotIdx - 19); i <= pastSlotIdx; i++) {
    for (const raw of b.slotDraws[i]!.numbers) {
      const n = parseInt(raw, 10);
      if (!isNaN(n) && n >= 0 && n <= 99) slotTokens.push(n);
    }
  }
  const slotDecenaCounts = new Array(10).fill(0);
  for (const n of slotTokens) slotDecenaCounts[decadeOf(n)]!++;
  const maxSlotDecena = Math.max(...slotDecenaCounts);
  const activeSlotDecenas = new Set<number>();
  slotDecenaCounts.forEach((c, i) => {
    if (c === maxSlotDecena && c > 0) activeSlotDecenas.add(i);
  });

  // Decena del sorteo inmediatamente anterior de la jornada.
  let prevSlotDecade = -1;
  if (pastSlotIdx >= 0) {
    for (const raw of b.slotDraws[pastSlotIdx]!.numbers) {
      const n = parseInt(raw, 10);
      if (!isNaN(n) && n >= 0 && n <= 99) {
        prevSlotDecade = decadeOf(n);
        break;
      }
    }
  }

  return {
    lastGlobalWinner: lw,
    prevGlobalWinner: prevWinner,
    yesterdaySlotWinner,
    activeDecenas,
    hotTerminations,
    coldTerminations,
    activeDozen,
    activeSlotDecenas,
    prevSlotDecade,
    slotDatesAsc: b.slotDraws.map((d) => d.drawDate),
    suenoNumbers: SUEÑO_NUMBERS,
    term100: heatTerm100(b, now),
    decena100: heatDecena100(b, now),
  };
}

/** Terminaciones (dígito) de los últimos 100 sorteos de la jornada antes de `now`. */
function heatTerm100(b: CtxBuilder, now: number): number[] {
  const out = new Array(10).fill(0);
  const idx = rightmostBefore(b.slotDraws.map((d) => d.drawDate), now);
  const start = Math.max(0, idx - 99);
  for (let i = start; i <= idx; i++) {
    for (const raw of b.slotDraws[i]!.numbers) {
      const n = parseInt(raw, 10);
      if (!isNaN(n) && n >= 0 && n <= 99) out[n % 10]!++;
    }
  }
  return out;
}

/** Decenas de los últimos 100 sorteos de la jornada antes de `now`. */
function heatDecena100(b: CtxBuilder, now: number): number[] {
  const out = new Array(10).fill(0);
  const idx = rightmostBefore(b.slotDraws.map((d) => d.drawDate), now);
  const start = Math.max(0, idx - 99);
  for (let i = start; i <= idx; i++) {
    for (const raw of b.slotDraws[i]!.numbers) {
      const n = parseInt(raw, 10);
      if (!isNaN(n) && n >= 0 && n <= 99) out[decadeOf(n)]!++;
    }
  }
  return out;
}

function daysBetween(now: number, lastTs: number): number {
  return Math.floor((now - lastTs) / DAY);
}

/** Promedio (en días) entre apariciones consecutivas antes de `now`. */
function avgIntervalBefore(tsArr: number[], now: number): number {
  const idx = rightmostBefore(tsArr, now);
  if (idx < 1) return Number.POSITIVE_INFINITY;
  let total = 0;
  for (let i = 0; i < idx; i++) total += (tsArr[i + 1]! - tsArr[i]!) / DAY;
  return total / idx;
}

/** Número de sorteos de la jornada transcurridos desde la última aparición de `w` antes de `now`. */
function slotGapsBefore(slotDatesAsc: number[], numSlotTs: number[], now: number): number {
  const draws = rightmostBefore(slotDatesAsc, now);
  const last = rightmostBefore(numSlotTs, now);
  if (last < 0) return draws + 1; // nunca apareció en la jornada
  // Posición del último sorteo de la jornada donde apareció (ascendente).
  const ts = numSlotTs[last]!;
  const pos = rightmostBefore(slotDatesAsc, ts + 1); // índice incluido
  return draws - pos;
}

/** Promedio de sorteos de la jornada entre apariciones consecutivas de `w`. */
function avgSlotGap(slotDatesAsc: number[], numSlotTs: number[], now: number): number {
  const last = rightmostBefore(numSlotTs, now);
  if (last < 1) return Number.POSITIVE_INFINITY;
  let total = 0;
  let count = 0;
  // Posición (en sorteos) de cada aparición, asc.
  const positions: number[] = [];
  for (let i = 0; i <= last; i++) {
    const pos = rightmostBefore(slotDatesAsc, numSlotTs[i]! + 1);
    if (positions.length === 0 || pos !== positions[positions.length - 1]!) positions.push(pos);
  }
  for (let i = 1; i < positions.length; i++) {
    total += positions[i]! - positions[i - 1]!;
    count++;
  }
  return count === 0 ? Number.POSITIVE_INFINITY : total / count;
}

function evaluateFeature(
  f: FeatureCode,
  w: number,
  now: number,
  ctx: GlobalCtx,
  numTs: number[],
  numSlotTs: number[],
): boolean {
  const lastG = rightmostBefore(numTs, now);
  const lastGlobalTs = lastG >= 0 ? numTs[lastG]! : null;
  const daysGlobal = lastGlobalTs == null ? 999 : daysBetween(now, lastGlobalTs);

  const lastS = rightmostBefore(numSlotTs, now);
  const lastSlotTs = lastS >= 0 ? numSlotTs[lastS]! : null;
  const daysSlot = lastSlotTs == null ? 999 : daysBetween(now, lastSlotTs);

  let count10 = 0;
  const tenDaysAgo = now - 10 * DAY;
  for (let i = lastG; i >= 0 && numTs[i]! >= tenDaysAgo; i--) count10++;

  const lw = ctx.lastGlobalWinner;
  const [d1, d2] = lw >= 0 ? digits(lw) : [-1, -1];
  const productoInterno = lw >= 0 ? (d1 * d2) % 100 : -1;
  const sumaConsecutiva =
    lw >= 0 && ctx.prevGlobalWinner >= 0 ? (lw + ctx.prevGlobalWinner) % 100 : -1;
  const avgInt = avgIntervalBefore(numTs, now);

  switch (f) {
    case "frio_absoluto":
      return daysGlobal > 30;
    case "frio_horario":
      return daysSlot > 15;
    case "despertar_promedio":
      return daysGlobal >= 7 && daysGlobal <= 14;
    case "latencia_reciente":
      return daysGlobal >= 3 && daysGlobal <= 6;
    case "caliente_cortoplazo":
      return count10 >= 3;
    case "eco_consecutivo":
      return w === lw;
    case "eco_horario":
      return w === ctx.yesterdaySlotWinner;
    case "digitos_gemelos":
      return Math.floor(w / 10) === w % 10;
    case "cluster_decena_activa":
      return ctx.activeDecenas.has(decadeOf(w));
    case "terminacion_caliente":
      return ctx.hotTerminations.has(w % 10);
    case "inversion_directa":
      return lw >= 0 && w === (lw % 10) * 10 + Math.floor(lw / 10);
    case "multiplo_base_cinco":
      return w % 5 === 0;
    case "multiplo_generacional":
      return lw > 0 && (w % lw === 0 || (w > 0 && lw % w === 0));
    case "producto_interno":
      return lw >= 0 && w === productoInterno;
    case "suma_consecutiva":
      return lw >= 0 && ctx.prevGlobalWinner >= 0 && w === sumaConsecutiva;
    case "presencia_corta":
      return daysGlobal <= 5;
    case "sobredemora":
      return Number.isFinite(avgInt) && daysGlobal > avgInt;
    case "pareja_100":
      return lw >= 0 && w === (100 - lw) % 100;
    case "complemento_99":
      return lw >= 0 && w === (99 - lw) % 100;
    case "vecino_ganador":
      return lw >= 0 && Math.abs(w - lw) === 1;
    case "raiz_digitos_ganador":
      return lw >= 0 && w === (d1 + d2) % 100;
    case "docena_activa":
      return ctx.activeDozen.has(dozenOf(w));
    case "decena_activa_jornada":
      return ctx.activeSlotDecenas.has(decadeOf(w));
    case "favorito_jornada_anterior":
      return ctx.prevSlotDecade >= 0 && decadeOf(w) === ctx.prevSlotDecade;
    case "terminacion_fria":
      return ctx.coldTerminations.has(w % 10);
    case "frecuencia_100": {
      // Frecuencia en los últimos 100 sorteos de ESTE juego (jornada).
      const last100 = ctx.slotDatesAsc.filter((d) => d < now).slice(-100);
      const threshold = last100[0] ?? -Infinity;
      let freq = 0;
      for (const ts of numSlotTs) {
        if (ts >= threshold && ts < now) freq++;
      }
      return freq >= 3;
    }
    case "reciente_5_juego": {
      return slotGapsBefore(ctx.slotDatesAsc, numSlotTs, now) <= 5;
    }
    case "terminacion_top_100": {
      const maxT = Math.max(...ctx.term100);
      return maxT > 0 && ctx.term100[w % 10] === maxT;
    }
    case "decena_top_100": {
      const maxD = Math.max(...ctx.decena100);
      return maxD > 0 && ctx.decena100[decadeOf(w)] === maxD;
    }
    case "promedio_vencido": {
      const gap = slotGapsBefore(ctx.slotDatesAsc, numSlotTs, now);
      const avg = avgSlotGap(ctx.slotDatesAsc, numSlotTs, now);
      return Number.isFinite(avg) && gap > avg;
    }
    case "gusto_sueno":
      return ctx.suenoNumbers.has(w);
  }
  return false;
}

export interface ComplianceSummary {
  hits: HitResult[];
  totalHits: number;
  /** Número de sorteos de la jornada evaluados en la ventana. */
  evaluatedDraws: number;
}

export interface TopCombo {
  features: FeatureCode[];
  label: string;
  /** Cuántos sorteos de la ventana tuvieron un ganador con TODA la combinación activa. */
  count: number;
  /** count/evaluatedDraws %. */
  hitRatePct: number;
  /** Sorteos donde se dio (fechas, las más recientes primero). */
  hits: { drawDate: string; sessionId: string }[];
}

/**
 * Calcula las combinaciones de `k` características que más veces estuvieron
 * activas a la vez en el/los números ganadores de la jornada objetivo durante
 * los últimos `maxDraws` sorteos. Reconstruye el estado justo antes de cada
 * sorteo (misma infraestructura que complianceSummary).
 */

/** True si la combinación repite la clasificación (`category`) de algún patrón. */
function hasDuplicatedCategory(features: FeatureCode[]): boolean {
  const seen = new Set<string>();
  for (const f of features) {
    const cat = FEATURE_META[f].category;
    if (cat === "none") continue;
    if (seen.has(cat)) return true;
    seen.add(cat);
  }
  return false;
}

export function topFeatureCombos(
  familyDraws: Draw[],
  slotDraws: Draw[],
  opts: { k?: number; maxDraws?: number; topN?: number } = {},
): { evaluatedDraws: number; combos: TopCombo[] } {
  const k = Math.max(1, Math.min(opts.k ?? 3, 7));
  const maxDraws = Math.max(1, Math.min(opts.maxDraws ?? 30, 120));
  const topN = Math.max(1, Math.min(opts.topN ?? 10, 25));

  const b = buildIndexes(familyDraws, slotDraws);
  const slotAsc = [...b.slotDraws].sort((a, b) => a.drawDate - b.drawDate).slice(-maxDraws);
  if (slotAsc.length === 0) return { evaluatedDraws: 0, combos: [] };

  const counts = new Map<string, { features: FeatureCode[]; count: number; hits: { drawDate: string; sessionId: string }[]; seenLastDraw: Set<string> }>();

  const bump = (features: FeatureCode[], sortKey: string, draw: Draw) => {
    let rec = counts.get(sortKey);
    if (!rec) {
      rec = { features: [...features].sort(), count: 0, hits: [], seenLastDraw: new Set() };
      counts.set(sortKey, rec);
    }
    if (rec.seenLastDraw.has(draw.sessionId)) return; // 1 por sorteo
    rec.seenLastDraw.add(draw.sessionId);
    rec.count++;
    rec.hits.unshift({ drawDate: new Date(draw.drawDate).toISOString(), sessionId: draw.sessionId });
  };

  for (const draw of slotAsc) {
    const ctx = buildGlobalCtx(b, draw.drawDate);
    for (const raw of draw.numbers) {
      const n = parseInt(raw, 10);
      if (isNaN(n) || n < 0 || n > 99) continue;
      const active: FeatureCode[] = [];
      for (const f of ALL_FEATURES) {
        if (evaluateFeature(f, n, draw.drawDate, ctx, b.numTs[n]!, b.numSlotTs[n]!)) active.push(f);
      }
      if (active.length < k) continue;
      for (const combo of combine(active, k)) {
        // Descartar combinaciones que repitan CLASIFICACIÓN (ej. dos 'decena'):
        // son redundantes y sobreestiman el porcentaje.
        if (hasDuplicatedCategory(combo)) continue;
        const sortKey = [...combo].sort().join("|");
        bump(combo, sortKey, draw);
      }
    }
  }

  const evaluatedDraws = slotAsc.length;
  const combos = [...counts.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, topN)
    .map((rec) => ({
      features: rec.features,
      label: rec.features.map((f) => FEATURE_LABELS[f]).join(" + "),
      count: rec.count,
      hitRatePct: Math.round((rec.count / evaluatedDraws) * 100),
      hits: rec.hits.slice(0, 30),
    }));

  return { evaluatedDraws, combos };
}

/** Genera todas las combinaciones de tamaño `k` de `arr`. */
function combine<T>(arr: T[], k: number): T[][] {
  const out: T[][] = [];
  const rec = (start: number, acc: T[]): void => {
    if (acc.length === k) {
      out.push([...acc]);
      return;
    }
    for (let i = start; i < arr.length; i++) {
      acc.push(arr[i]!);
      rec(i + 1, acc);
      acc.pop();
    }
  };
  rec(0, []);
  return out;
}

/**
 * Reconstruye el estado previo a cada sorteo de la jornada objetivo (hasta
 * MAX_EVALUATED_DRAWS) y devuelve un resumen: los sorteos donde un ganador
 * cumplía TODAS las características pedidas (en orden cronológico), el total
 * de aciertos y cuántos sorteos se evaluaron.
 */
export function complianceSummary(
  features: FeatureCode[],
  familyDraws: Draw[],
  slotDraws: Draw[],
): ComplianceSummary {
  const valid = features.filter((f) => ALL_FEATURES.includes(f));
  if (valid.length === 0) return { hits: [], totalHits: 0, evaluatedDraws: 0 };

  const b = buildIndexes(familyDraws, slotDraws);
  const slotAsc = [...b.slotDraws].sort((a, b) => a.drawDate - b.drawDate);
  const start = Math.max(0, slotAsc.length - MAX_EVALUATED_DRAWS);
  const out: HitResult[] = [];

  for (let i = start; i < slotAsc.length; i++) {
    const d = slotAsc[i]!;
    const ctx = buildGlobalCtx(b, d.drawDate);
    const matched: number[] = [];
    for (const raw of d.numbers) {
      const n = parseInt(raw, 10);
      if (
        !isNaN(n) &&
        n >= 0 &&
        n <= 99 &&
        valid.every((f) => evaluateFeature(f, n, d.drawDate, ctx, b.numTs[n]!, b.numSlotTs[n]!))
      ) {
        matched.push(n);
      }
    }
    if (matched.length > 0) {
      out.push({
        drawDate: new Date(d.drawDate).toISOString(),
        sessionId: d.sessionId,
        numbers: d.numbers,
        matchedNumbers: matched,
      });
    }
  }

  return {
    hits: out.slice(-MAX_RETURNED_HITS),
    totalHits: out.length,
    evaluatedDraws: slotAsc.length - start,
  };
}

/**
 * Reconstruye el estado previo a cada sorteo de la jornada objetivo (hasta
 * MAX_EVALUATED_DRAWS) y devuelve los sorteos donde un ganador cumplía TODAS
 * las características pedidas, en orden cronológico.
 */
export function computeWinnerCompliance(
  features: FeatureCode[],
  familyDraws: Draw[],
  slotDraws: Draw[],
): HitResult[] {
  return complianceSummary(features, familyDraws, slotDraws).hits;
}

/** Últimos aciertos cronológicos (máx MAX_RETURNED_HITS). */
export function lastHits(
  features: FeatureCode[],
  familyDraws: Draw[],
  slotDraws: Draw[],
): HitResult[] {
  return computeWinnerCompliance(features, familyDraws, slotDraws);
}