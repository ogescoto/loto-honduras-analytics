/**
 * Motor de características analíticas — CareceteristicasPatrones.md (ampliado)
 *
 * Para cada número (00-99) calcula un estado booleano/numérico basado en el
 * historial de sorteos de un juego. El resultado se guarda en number_states
 * y se recalcula tras cada sorteo (o en vivo).
 *
 * Catálogo por bloque:
 *  A: Recencia     — frio_absoluto, frio_horario, despertar_promedio, latencia_reciente
 *  B: Frecuencia   — caliente_cortoplazo, eco_consecutivo, eco_horario
 *  C: Anatomía     — digitos_gemelos, cluster_decena_activa, terminacion_caliente
 *  D: Aritmética   — inversion_directa, multiplo_base_cinco, multiplo_generacional,
 *                    producto_interno, suma_consecutiva
 *  E: Recencia+    — presencia_corta, sobredemora
 *  F: Complemento  — pareja_100, complemento_99, vecino_ganador, raiz_digitos_ganador
 *  G: Estructura   — docena_activa, decena_activa_jornada, favorito_jornada_anterior,
 *                    terminacion_fria
 *  H: Perfil juego — frecuencia_100, reciente_5_juego, terminacion_top_100,
 *                    decena_top_100, promedio_vencido, gusto_sueno
 */
import { DREAM_GUIDE } from "./dream-guide.js";

export type FeatureCode =
  | "frio_absoluto"
  | "frio_horario"
  | "despertar_promedio"
  | "latencia_reciente"
  | "caliente_cortoplazo"
  | "eco_consecutivo"
  | "eco_horario"
  | "digitos_gemelos"
  | "cluster_decena_activa"
  | "terminacion_caliente"
  | "inversion_directa"
  | "multiplo_base_cinco"
  | "multiplo_generacional"
  | "producto_interno"
  | "suma_consecutiva"
  | "presencia_corta"
  | "sobredemora"
  | "pareja_100"
  | "complemento_99"
  | "vecino_ganador"
  | "raiz_digitos_ganador"
  | "docena_activa"
  | "decena_activa_jornada"
  | "favorito_jornada_anterior"
  | "terminacion_fria"
  // Bloque H — perfil del juego (ventana de 100 sorteos de ESTE juego)
  | "frecuencia_100"
  | "reciente_5_juego"
  | "terminacion_top_100"
  | "decena_top_100"
  | "promedio_vencido"
  | "gusto_sueno";

export const ALL_FEATURES: FeatureCode[] = [
  "frio_absoluto", "frio_horario", "despertar_promedio", "latencia_reciente",
  "caliente_cortoplazo", "eco_consecutivo", "eco_horario",
  "digitos_gemelos", "cluster_decena_activa", "terminacion_caliente",
  "inversion_directa", "multiplo_base_cinco", "multiplo_generacional",
  "producto_interno", "suma_consecutiva",
  "presencia_corta", "sobredemora",
  "pareja_100", "complemento_99", "vecino_ganador", "raiz_digitos_ganador",
  "docena_activa", "decena_activa_jornada", "favorito_jornada_anterior",
  "terminacion_fria",
  "frecuencia_100", "reciente_5_juego", "terminacion_top_100",
  "decena_top_100", "promedio_vencido", "gusto_sueno",
];

export const FEATURE_LABELS: Record<FeatureCode, string> = {
  frio_absoluto:        "Frío Absoluto",
  frio_horario:         "Frío Horario",
  despertar_promedio:   "Despertar Promedio",
  latencia_reciente:    "Latencia Reciente",
  caliente_cortoplazo:  "Caliente de Corto Plazo",
  eco_consecutivo:      "Eco Consecutivo",
  eco_horario:          "Eco Horario",
  digitos_gemelos:      "Dígitos Gemelos",
  cluster_decena_activa:"Clúster de Decena Activa",
  terminacion_caliente: "Terminación Caliente",
  inversion_directa:    "Inversión Directa",
  multiplo_base_cinco:  "Múltiplo de Base Cinco",
  multiplo_generacional:"Múltiplo Generacional",
  producto_interno:     "Producto Interno",
  suma_consecutiva:     "Suma Consecutiva Móvil",
  presencia_corta:      "Presencia Corta",
  sobredemora:          "Sobredemora",
  pareja_100:           "Pareja 100",
  complemento_99:       "Complemento 99",
  vecino_ganador:       "Vecino del Ganador",
  raiz_digitos_ganador: "Raíz de Dígitos del Ganador",
  docena_activa:        "Docena Activa",
  decena_activa_jornada:"Decena Activa de la Jornada",
  favorito_jornada_anterior: "Favorito de la Jornada Anterior",
  terminacion_fria:     "Terminación Fría",
  frecuencia_100:       "Frecuencia 100",
  reciente_5_juego:     "Reciente en este juego (5)",
  terminacion_top_100:  "Terminación Top 100 del juego",
  decena_top_100:       "Decena Top 100 del juego",
  promedio_vencido:     "Promedio Vencido (juego)",
  gusto_sueno:          "Gusto del Sueño (imaginario)",
};

export const FEATURE_DESCRIPTIONS: Record<FeatureCode, string> = {
  frio_absoluto:        "Más de 30 días sin aparecer en ninguna jornada.",
  frio_horario:         "Más de 15 días sin salir en esta jornada específica.",
  despertar_promedio:   "Entre 7 y 14 días sin jugar — en su ventana promedio de salida.",
  latencia_reciente:    "Entre 3 y 6 días de ausencia — suele reaparecer pronto.",
  caliente_cortoplazo:  "Salió 3 o más veces en los últimos 10 días.",
  eco_consecutivo:      "Es el mismo número que cayó en el sorteo inmediatamente anterior.",
  eco_horario:          "Cayó ayer exactamente en esta misma jornada.",
  digitos_gemelos:      "Número con ambos dígitos idénticos (00, 11, 22… 99).",
  cluster_decena_activa:"Pertenece a la decena con más salidas en los últimos 3 días.",
  terminacion_caliente: "Su dígito final coincide con la terminación más frecuente de las últimas 15 jugadas.",
  inversion_directa:    "Es el número espejo del último resultado (52 → 25).",
  multiplo_base_cinco:  "Terminado en 0 o 5 (múltiplo de 5).",
  multiplo_generacional:"Es múltiplo o divisor del número que acaba de caer.",
  producto_interno:     "Igual al producto de los dígitos del último resultado (3×4=12).",
  suma_consecutiva:     "Igual a la suma de los dos últimos ganadores globales (mod 100).",
  presencia_corta:      "Salió en los últimos 5 días (recencia muy reciente).",
  sobredemora:          "Lleva más días sin salir que su promedio histórico entre apariciones.",
  pareja_100:           "Suma 100 con el último número ganador (73 → 27).",
  complemento_99:       "Suma 99 con el último número ganador (52 → 47).",
  vecino_ganador:       "Adyacente al último ganador (52 → 51 o 53).",
  raiz_digitos_ganador: "Coincide con la suma de dígitos del último ganador (45 → 09).",
  docena_activa:        "Pertenece a la docena (bloque de 12) con más salidas recientes.",
  decena_activa_jornada:"Pertenece a la decena con más jugadas en esta misma jornada (últimos 10 sorteos).",
  favorito_jornada_anterior: "Pertenece a la decena que jugó el sorteo inmediatamente anterior de esta jornada.",
  terminacion_fria:     "Su dígito final es la terminación menos frecuente de las últimas 15 jugadas.",
  frecuencia_100:       "Salió al menos 3 veces en los últimos 100 sorteos de ESTE juego.",
  reciente_5_juego:     "Apareció en uno de los últimos 5 sorteos de ESTE juego.",
  terminacion_top_100:  "Su dígito final está entre las terminaciones más frecuentes de los últimos 100 sorteos de ESTE juego.",
  decena_top_100:       "Pertenece a la decena con más salidas en los últimos 100 sorteos de ESTE juego.",
  promedio_vencido:     "En ESTE juego lleva más sorteos sin salir que su promedio histórico entre apariciones.",
  gusto_sueno:          "El número aparece en la guía de los sueños (imaginario popular).",
};

/**
 * Metadata técnica por patrón — expuesta en /config para que el admin sepa
 * "cómo está hecho" cada patrón.
 * - scope: "familia" = analiza la secuencia de TODA la familia (varias jornadas
 *   del mismo tipo de juego en días seguidos); "juego" = solo la jornada/específico
 *   de ese juego (ej. la hora concreta).
 * - windowDesc: ventana de análisis en sorteos/días.
 */
export interface FeatureMeta {
  scope: "familia" | "juego";
  windowDesc: string;
  /**
   * Clasificación por tipo de cálculo. PATRONES DE LA MISMA CATEGORÍA NO PUEDEN
   * combinarse (ej. dos 'decena'), para que una combinación no redoble el mismo
   * criterio. `none` = sin restricción (se combina libremente).
   */
  category: FeatureCategory;
}

export type FeatureCategory =
  | "decena"      // basados en la decena (bloque de 10)
  | "docena"      // basados en la docena (bloque de 12)
  | "terminacion" // basados en el dígito final
  | "paridad"     // basados en par/impar
  | "multiplicidad" // múltiplos
  | "anatomia"    // estructura de dígitos del número mismo
  | "complemento" // complementos/suma con el último ganador
  | "recencia"    // ausencia/ventana de días
  | "frecuencia"  // conteo de apariciones
  | "ecos"        // repetición del ganador
  | "desequilibrio" // sobredemora / vencido
  | "imaginario"  // guía de sueños
  | "jornada"     // contexto de la jornada/hora
  | "none";       // sin clasificación excluyente

export const FEATURE_META: Record<FeatureCode, FeatureMeta> = {
  frio_absoluto:        { scope: "familia", windowDesc: ">30 días sin aparecer en la familia", category: "recencia" },
  frio_horario:         { scope: "juego", windowDesc: ">15 días sin salir en ESTA jornada (hora)", category: "recencia" },
  despertar_promedio:   { scope: "familia", windowDesc: "familia · 7–14 días de ausencia", category: "recencia" },
  latencia_reciente:    { scope: "familia", windowDesc: "familia · 3–6 días de ausencia", category: "recencia" },
  caliente_cortoplazo:  { scope: "familia", windowDesc: "≥3 salidas en últimos 10 días (familia)", category: "frecuencia" },
  eco_consecutivo:      { scope: "familia", windowDesc: "mismo número del sorteo inmediatamente anterior (familia)", category: "ecos" },
  eco_horario:          { scope: "juego", windowDesc: "cayó ayer en ESTA jornada (hora)", category: "ecos" },
  digitos_gemelos:      { scope: "familia", windowDesc: "anatomía: ambos dígitos iguales (atemporal)", category: "anatomia" },
  cluster_decena_activa:{ scope: "familia", windowDesc: "decena más salida de la familia · últimos 3 días", category: "decena" },
  terminacion_caliente: { scope: "familia", windowDesc: "terminación más frecuente · últimas 15 jugadas de la familia", category: "terminacion" },
  inversion_directa:    { scope: "familia", windowDesc: "espejo del último ganador (familia)", category: "anatomia" },
  multiplo_base_cinco:  { scope: "familia", windowDesc: "termina en 0 o 5 (atemporal)", category: "multiplicidad" },
  multiplo_generacional:{ scope: "familia", windowDesc: "múltiplo/divisor del último ganador (familia)", category: "multiplicidad" },
  producto_interno:     { scope: "familia", windowDesc: "producto de dígitos del último ganador (familia)", category: "anatomia" },
  suma_consecutiva:     { scope: "familia", windowDesc: "suma de los 2 últimos ganadores (familia)", category: "complemento" },
  presencia_corta:      { scope: "familia", windowDesc: "salió en últimos 5 días (familia)", category: "recencia" },
  sobredemora:          { scope: "familia", windowDesc: "gap de días > promedio histórico (familia)", category: "desequilibrio" },
  pareja_100:           { scope: "familia", windowDesc: "complemento a 100 del último ganador (familia)", category: "complemento" },
  complemento_99:       { scope: "familia", windowDesc: "complemento a 99 del último ganador (familia)", category: "complemento" },
  vecino_ganador:       { scope: "familia", windowDesc: "adyacente al último ganador (familia)", category: "complemento" },
  raiz_digitos_ganador: { scope: "familia", windowDesc: "suma de dígitos del último ganador (familia)", category: "anatomia" },
  docena_activa:        { scope: "familia", windowDesc: "docena más salida · últimas 30 jugadas (familia)", category: "docena" },
  decena_activa_jornada:{ scope: "juego", windowDesc: "decena más jugada en ESTA jornada · últimos 10 sorteos", category: "decena" },
  favorito_jornada_anterior: { scope: "juego", windowDesc: "decena del sorteo inmediatamente anterior de ESTA jornada", category: "decena" },
  terminacion_fria:     { scope: "familia", windowDesc: "terminación menos frecuente · últimas 15 jugadas (familia)", category: "terminacion" },
  frecuencia_100:       { scope: "juego", windowDesc: "juego · ≥3 salidas en los últimos 100 sorteos de ESTA jornada", category: "frecuencia" },
  reciente_5_juego:     { scope: "juego", windowDesc: "juego · salió en uno de los últimos 5 sorteos de ESTA jornada", category: "recencia" },
  terminacion_top_100:  { scope: "juego", windowDesc: "juego · terminación top en los últimos 100 sorteos de ESTA jornada", category: "terminacion" },
  decena_top_100:       { scope: "juego", windowDesc: "juego · decena top en los últimos 100 sorteos de ESTA jornada", category: "decena" },
  promedio_vencido:     { scope: "juego", windowDesc: "juego · gap en sorteos > promedio histórico de ESTA jornada", category: "desequilibrio" },
  gusto_sueno:          { scope: "familia", windowDesc: "imaginario popular: número en la guía de los sueños (atemporal)", category: "imaginario" },
};

export type NumberFeatures = Record<FeatureCode, boolean>;

export interface NumberState {
  number: number;   // 0-99
  features: NumberFeatures;
  daysSinceLastGlobal: number;
  daysSinceLastInSlot: number;
  countLast10Days: number;
}

interface DrawEntry {
  number: number;
  drawDate: Date;
}

/** Extrae entradas numéricas de los sorteos (ignora alfanuméricos y comodines). */
function toEntries(draws: Array<{ numbers: string[]; drawDate: Date }>): DrawEntry[] {
  const out: DrawEntry[] = [];
  for (const d of draws) {
    for (const n of d.numbers) {
      const v = parseInt(n, 10);
      if (!isNaN(v) && v >= 0 && v <= 99) {
        out.push({ number: v, drawDate: d.drawDate });
      }
    }
  }
  return out;
}

function daysDiff(a: Date, b: Date): number {
  return Math.floor((b.getTime() - a.getTime()) / 86_400_000);
}

/** Docena (bloque de 12 números): 0-11, 12-23, …, 84-99. */
function dozenOf(num: number): number {
  return Math.min(Math.floor(num / 12), 7);
}

/** Decena (bloque de 10): 0-9, 10-19, …, 90-99. */
function decadeOf(num: number): number {
  return Math.floor(num / 10);
}

/** Promedio histórico en días entre apariciones globales consecutivas de un número. */
function avgIntervalDays(entries: DrawEntry[], number: number): number {
  const dates = entries
    .filter((e) => e.number === number)
    .map((e) => e.drawDate.getTime())
    .sort((a, b) => b - a); // más reciente primero
  if (dates.length < 2) return Number.POSITIVE_INFINITY;
  let total = 0;
  for (let i = 0; i < dates.length - 1; i++) {
    total += (dates[i]! - dates[i + 1]!) / 86_400_000;
  }
  return total / (dates.length - 1);
}

/** Número de sorteos de la jornada (ya descendentes) transcurridos desde la última aparición de `num`. */
function slotDrawGap(entries: DrawEntry[], number: number): number {
  const idx = entries.findIndex((e) => e.number === number);
  return idx === -1 ? entries.length : idx;
}

/** Promedio de sorteos de la jornada entre apariciones consecutivas del número. */
function avgSlotGap(entries: DrawEntry[], number: number): number {
  const idxs: number[] = [];
  entries.forEach((e, i) => {
    if (e.number === number) idxs.push(i);
  });
  if (idxs.length < 2) return Number.POSITIVE_INFINITY;
  let total = 0;
  for (let i = 0; i < idxs.length - 1; i++) total += idxs[i + 1]! - idxs[i]!;
  return total / (idxs.length - 1);
}

/**
 * Calcula el estado de todas las características para los 100 números (0-99).
 *
 * @param allDraws     Historial completo de la FAMILIA (todas las jornadas),
 *                     orden no importa (se ordena internamente).
 * @param slotDraws    Solo los sorteos de la jornada objetivo (11AM/3PM/9PM).
 * @param familyDraws  Idéntico a allDraws; se mantiene por claridad semántica.
 * @param now          Punto de referencia temporal (default: ahora).
 */
export function computeNumberStates(
  allDraws: Array<{ numbers: string[]; drawDate: Date }>,
  slotDraws: Array<{ numbers: string[]; drawDate: Date }>,
  familyDraws?: Array<{ numbers: string[]; drawDate: Date }>,
  now: Date = new Date(),
): NumberState[] {
  const fam = familyDraws ?? allDraws;
  const allEntries = toEntries(fam).sort((a, b) => b.drawDate.getTime() - a.drawDate.getTime());
  const slotEntries = toEntries(slotDraws).sort((a, b) => b.drawDate.getTime() - a.drawDate.getTime());

  // Último ganador global y el anterior (para características D y F).
  const lastGlobalWinner = allEntries[0]?.number ?? -1;
  const prevGlobalWinner = allEntries[1]?.number ?? -1;

  // Último ganador de la jornada de ayer.
  const yesterday = new Date(now.getTime() - 86_400_000);
  const yesterdaySlotWinner = slotEntries.find(
    (e) => Math.abs(daysDiff(e.drawDate, yesterday)) <= 1,
  )?.number ?? -1;

  // Clúster de decena activa: decena con más salidas en últimos 3 días (familia).
  const threeDaysAgo = new Date(now.getTime() - 3 * 86_400_000);
  const recentEntries3d = allEntries.filter((e) => e.drawDate >= threeDaysAgo);
  const decenaCounts = new Array(10).fill(0);
  for (const e of recentEntries3d) decenaCounts[decadeOf(e.number)]!++;
  const maxDecenaCount = Math.max(...decenaCounts);
  const activeDecenas = new Set(
    decenaCounts.map((c, i) => (c === maxDecenaCount && c > 0 ? i : -1)).filter((i) => i >= 0),
  );

  // Terminación caliente/fría: dígito final más y menos frecuente en últimas 15 jugadas.
  const last15 = allEntries.slice(0, 15);
  const termCounts = new Array(10).fill(0);
  for (const e of last15) termCounts[e.number % 10]!++;
  const maxTerm = Math.max(...termCounts);
  const hotTerminations = new Set(
    termCounts.map((c, i) => (c === maxTerm && c > 0 ? i : -1)).filter((i) => i >= 0),
  );
  const minTerm = Math.min(...termCounts.filter((c) => c > 0));
  const coldTerminations = new Set(
    termCounts.map((c, i) => (c === minTerm && c > 0 ? i : -1)).filter((i) => i >= 0),
  );

  // Docena activa: docena con más salidas en los últimos 10 sorteos (familia).
  const last10Draws = allEntries.slice(0, 10 * 3); // ~10 sorteos considerando ~1-3 números por sorteo
  const dozenCounts = new Array(8).fill(0);
  for (const e of last10Draws.slice(0, 30)) dozenCounts[dozenOf(e.number)]!++;
  const maxDozen = Math.max(...dozenCounts);
  const activeDozen = new Set(
    dozenCounts.map((c, i) => (c === maxDozen && c > 0 ? i : -1)).filter((i) => i >= 0),
  );

  // Decena activa de la jornada: decena con más jugadas en la jornada (últimos 10 sorteos de la jornada).
  const slotLast10 = slotEntries.slice(0, 30);
  const slotDecenaCounts = new Array(10).fill(0);
  for (const e of slotLast10.slice(0, 20)) slotDecenaCounts[decadeOf(e.number)]!++;
  const maxSlotDecena = Math.max(...slotDecenaCounts);
  const activeSlotDecenas = new Set(
    slotDecenaCounts.map((c, i) => (c === maxSlotDecena && c > 0 ? i : -1)).filter((i) => i >= 0),
  );

  // Jornada anterior inmediata: decena del último sorteo distinto a `now` de esta jornada.
  const prevSlotDraw = slotEntries.find((e) => e.drawDate.getTime() < now.getTime());
  const prevSlotDecade = prevSlotDraw ? decadeOf(prevSlotDraw.number) : -1;

  // ── Bloque H · perfil del juego (últimos 100 sorteos de ESTA jornada) ─────
  const slotLast100 = slotEntries.slice(0, 100); // ya descendente por fecha
  const slotHas5 = new Set(slotLast100.slice(0, 5).map((e) => e.number));
  const term100 = new Array(10).fill(0);
  const decena100 = new Array(10).fill(0);
  const freq100 = new Array(100).fill(0);
  for (const e of slotLast100) {
    term100[e.number % 10]!++;
    decena100[decadeOf(e.number)]!++;
    freq100[e.number]!++;
  }
  const maxTerm100 = Math.max(...term100);
  const topTerm100 = new Set(term100.map((c, i) => (c === maxTerm100 && c > 0 ? i : -1)).filter((i) => i >= 0));
  const maxDecena100 = Math.max(...decena100);
  const topDecena100 = new Set(decena100.map((c, i) => (c === maxDecena100 && c > 0 ? i : -1)).filter((i) => i >= 0));

  // Guía de los sueños (imaginario popular): números de referencia cultural.
  const suenoNumbers = new Set(Object.values(DREAM_GUIDE));

  // Ventanas de tiempo.
  const tenDaysAgo  = new Date(now.getTime() - 10 * 86_400_000);
  const fiveDaysAgo = new Date(now.getTime() - 5 * 86_400_000);
  const states: NumberState[] = [];

  for (let num = 0; num <= 99; num++) {
    // Último día que apareció globalmente (familia).
    const lastGlobal = allEntries.find((e) => e.number === num)?.drawDate;
    const daysSinceGlobal = lastGlobal ? daysDiff(lastGlobal, now) : 999;

    // Último día que apareció en la jornada específica.
    const lastSlot = slotEntries.find((e) => e.number === num)?.drawDate;
    const daysSinceSlot = lastSlot ? daysDiff(lastSlot, now) : 999;

    // Conteo en los últimos 10 días (familia).
    const countLast10 = allEntries.filter(
      (e) => e.number === num && e.drawDate >= tenDaysAgo,
    ).length;

    // Sobredemora: días desde última aparición > promedio histórico del número.
    const avgInterval = avgIntervalDays(allEntries, num);
    const sobredemora = Number.isFinite(avgInterval) && daysSinceGlobal > avgInterval;

    // Producto de dígitos del último ganador global.
    const d1 = Math.floor(lastGlobalWinner / 10);
    const d2 = lastGlobalWinner % 10;
    const productoInterno = (d1 * d2) % 100;

    // Suma de los dos últimos ganadores (mod 100).
    const sumaConsecutiva = (lastGlobalWinner + prevGlobalWinner) % 100;

    const features: NumberFeatures = {
      // Bloque A
      frio_absoluto:        daysSinceGlobal > 30,
      frio_horario:         daysSinceSlot > 15,
      despertar_promedio:   daysSinceGlobal >= 7 && daysSinceGlobal <= 14,
      latencia_reciente:    daysSinceGlobal >= 3 && daysSinceGlobal <= 6,
      // Bloque B
      caliente_cortoplazo:  countLast10 >= 3,
      eco_consecutivo:      num === lastGlobalWinner,
      eco_horario:          num === yesterdaySlotWinner,
      // Bloque C
      digitos_gemelos:      Math.floor(num / 10) === num % 10,
      cluster_decena_activa:activeDecenas.has(decadeOf(num)),
      terminacion_caliente: hotTerminations.has(num % 10),
      // Bloque D
      inversion_directa:    lastGlobalWinner >= 0 && num === ((lastGlobalWinner % 10) * 10 + Math.floor(lastGlobalWinner / 10)),
      multiplo_base_cinco:  num % 5 === 0,
      multiplo_generacional:lastGlobalWinner > 0 && (num % lastGlobalWinner === 0 || (num > 0 && lastGlobalWinner % num === 0)),
      producto_interno:     lastGlobalWinner >= 0 && num === productoInterno,
      suma_consecutiva:     lastGlobalWinner >= 0 && prevGlobalWinner >= 0 && num === sumaConsecutiva,
      // Bloque E — Recencia+
      presencia_corta:      lastGlobal ? lastGlobal >= fiveDaysAgo : false,
      sobredemora:          sobredemora,
      // Bloque F — Complemento aritmético
      pareja_100:           lastGlobalWinner >= 0 && num === (100 - lastGlobalWinner) % 100,
      complemento_99:       lastGlobalWinner >= 0 && num === (99 - lastGlobalWinner) % 100,
      vecino_ganador:       lastGlobalWinner >= 0 && Math.abs(num - lastGlobalWinner) === 1,
      raiz_digitos_ganador: lastGlobalWinner >= 0 && num === (d1 + d2) % 100,
      // Bloque G — Estructura por sorteo/jornada
      docena_activa:        activeDozen.has(dozenOf(num)),
      decena_activa_jornada:activeSlotDecenas.has(decadeOf(num)),
      favorito_jornada_anterior: prevSlotDecade >= 0 && decadeOf(num) === prevSlotDecade,
      terminacion_fria:     coldTerminations.has(num % 10),
      // Bloque H — Perfil del juego (últimos 100 sorteos de ESTE juego)
      frecuencia_100:       freq100[num]! >= 3,
      reciente_5_juego:     slotHas5.has(num),
      terminacion_top_100:  topTerm100.has(num % 10),
      decena_top_100:       topDecena100.has(decadeOf(num)),
      promedio_vencido:     Boolean(lastSlot && slotDrawGap(slotEntries, num) > avgSlotGap(slotEntries, num)),
      gusto_sueno:          suenoNumbers.has(num),
    };

    states.push({ number: num, features, daysSinceLastGlobal: daysSinceGlobal, daysSinceLastInSlot: daysSinceSlot, countLast10Days: countLast10 });
  }

  return states;
}

/**
 * Filtro combinatorio: devuelve los números que cumplen TODAS las características pedidas.
 * Si ninguno cumple todas, devuelve los que cumplen N-1 (aproximación inteligente).
 */
export function filterByFeatures(
  states: NumberState[],
  requested: FeatureCode[],
): { exact: number[]; partial: number[]; matchCount: number } {
  if (requested.length === 0) return { exact: [], partial: [], matchCount: 0 };

  const scores = states.map((s) => ({
    number: s.number,
    count: requested.filter((f) => s.features[f]).length,
  }));

  const exact = scores.filter((s) => s.count === requested.length).map((s) => s.number);
  if (exact.length > 0) return { exact, partial: [], matchCount: requested.length };

  // Aproximación: los que cumplen más características.
  const maxCount = Math.max(...scores.map((s) => s.count));
  const partial = scores.filter((s) => s.count === maxCount).map((s) => s.number);
  return { exact: [], partial, matchCount: maxCount };
}

/** Clasificación (tipo de cálculo) de un patrón. */
export function featureCategory(code: FeatureCode): FeatureCategory {
  return FEATURE_META[code].category;
}

/**
 * Detecta si una combinación de patrones incluye dos de la MISMA clasificación
 * excluyente (ej. dos 'decena'). Devuelve el conflicto o null si es válida.
 * `none` no restringe.
 */
export function findExclusiveConflict(features: FeatureCode[]): {
  category: FeatureCategory;
  codes: FeatureCode[];
} | null {
  if (features.length < 2) return null;
  const byCat = new Map<FeatureCategory, FeatureCode[]>();
  for (const c of features) {
    const cat = FEATURE_META[c].category;
    if (cat === "none") continue;
    const arr = byCat.get(cat) ?? [];
    arr.push(c);
    byCat.set(cat, arr);
  }
  for (const [cat, codes] of byCat) {
    if (codes.length > 1) return { category: cat, codes };
  }
  return null;
}
