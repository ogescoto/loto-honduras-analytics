/**
 * Motor de las 15 características analíticas — CareceteristicasPatrones.md
 *
 * Para cada número (00-99) calcula un estado booleano/numérico basado en el
 * historial de sorteos de un juego. El resultado se guarda en number_states
 * y se recalcula tras cada sorteo.
 *
 * Características por bloque:
 *  A: Recencia      — 1.FrioAbsoluto, 2.FrioHorario, 3.DespertarPromedio, 4.LatenciaReciente
 *  B: Frecuencia    — 5.CalienteCortoplazo, 6.EcoConsecutivo, 7.EcoHorario
 *  C: Anatomía      — 8.DigitosGemelos, 9.ClusterDecenaActiva, 10.TerminacionCaliente
 *  D: Aritmética    — 11.InversionDirecta, 12.MultiploBaseCinco,
 *                     13.MultiploGeneracional, 14.ProductoInterno, 15.SumaConsecutiva
 */

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
  | "suma_consecutiva";

export const ALL_FEATURES: FeatureCode[] = [
  "frio_absoluto", "frio_horario", "despertar_promedio", "latencia_reciente",
  "caliente_cortoplazo", "eco_consecutivo", "eco_horario",
  "digitos_gemelos", "cluster_decena_activa", "terminacion_caliente",
  "inversion_directa", "multiplo_base_cinco", "multiplo_generacional",
  "producto_interno", "suma_consecutiva",
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

/**
 * Calcula el estado de las 15 características para los 100 números (0-99)
 * dado el historial de sorteos de un juego específico.
 *
 * @param allDraws   Historial completo del juego (cualquier jornada)
 * @param slotDraws  Solo los sorteos de la jornada objetivo (11AM, 3PM, 9PM)
 * @param now        Punto de referencia temporal (default: ahora)
 */
export function computeNumberStates(
  allDraws: Array<{ numbers: string[]; drawDate: Date }>,
  slotDraws: Array<{ numbers: string[]; drawDate: Date }>,
  now: Date = new Date(),
): NumberState[] {
  const allEntries = toEntries(allDraws).sort((a, b) => b.drawDate.getTime() - a.drawDate.getTime());
  const slotEntries = toEntries(slotDraws).sort((a, b) => b.drawDate.getTime() - a.drawDate.getTime());

  // Último ganador global y el anterior (para características D)
  const lastGlobalWinner = allEntries[0]?.number ?? -1;
  const prevGlobalWinner = allEntries[1]?.number ?? -1;

  // Último ganador de la jornada de ayer
  const yesterday = new Date(now.getTime() - 86_400_000);
  const yesterdaySlotWinner = slotEntries.find(
    (e) => Math.abs(daysDiff(e.drawDate, yesterday)) <= 1,
  )?.number ?? -1;

  // Clúster de decena activa: decena con más salidas en últimos 3 días
  const threeDaysAgo = new Date(now.getTime() - 3 * 86_400_000);
  const recentEntries3d = allEntries.filter((e) => e.drawDate >= threeDaysAgo);
  const decenaCounts = new Array(10).fill(0);
  for (const e of recentEntries3d) decenaCounts[Math.floor(e.number / 10)]!++;
  const maxDecenaCount = Math.max(...decenaCounts);
  const activeDecenas = new Set(
    decenaCounts.map((c, i) => (c === maxDecenaCount && c > 0 ? i : -1)).filter((i) => i >= 0),
  );

  // Terminación caliente: dígito final más frecuente en últimas 15 jugadas
  const last15 = allEntries.slice(0, 15);
  const termCounts = new Array(10).fill(0);
  for (const e of last15) termCounts[e.number % 10]!++;
  const maxTerm = Math.max(...termCounts);
  const hotTerminations = new Set(
    termCounts.map((c, i) => (c === maxTerm && c > 0 ? i : -1)).filter((i) => i >= 0),
  );

  // Ventanas de tiempo
  const tenDaysAgo  = new Date(now.getTime() - 10 * 86_400_000);
  const states: NumberState[] = [];

  for (let num = 0; num <= 99; num++) {
    // Último día que apareció globalmente
    const lastGlobal = allEntries.find((e) => e.number === num)?.drawDate;
    const daysSinceGlobal = lastGlobal ? daysDiff(lastGlobal, now) : 999;

    // Último día que apareció en la jornada específica
    const lastSlot = slotEntries.find((e) => e.number === num)?.drawDate;
    const daysSinceSlot = lastSlot ? daysDiff(lastSlot, now) : 999;

    // Conteo en los últimos 10 días
    const countLast10 = allEntries.filter(
      (e) => e.number === num && e.drawDate >= tenDaysAgo,
    ).length;

    // Producto de dígitos del último ganador global
    const d1 = Math.floor(lastGlobalWinner / 10);
    const d2 = lastGlobalWinner % 10;
    const productoInterno = (d1 * d2) % 100;

    // Suma de los dos últimos ganadores (mod 100)
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
      cluster_decena_activa:activeDecenas.has(Math.floor(num / 10)),
      terminacion_caliente: hotTerminations.has(num % 10),
      // Bloque D
      inversion_directa:    lastGlobalWinner >= 0 && num === ((lastGlobalWinner % 10) * 10 + Math.floor(lastGlobalWinner / 10)),
      multiplo_base_cinco:  num % 5 === 0,
      multiplo_generacional:lastGlobalWinner > 0 && (num % lastGlobalWinner === 0 || (num > 0 && lastGlobalWinner % num === 0)),
      producto_interno:     lastGlobalWinner >= 0 && num === productoInterno,
      suma_consecutiva:     lastGlobalWinner >= 0 && prevGlobalWinner >= 0 && num === sumaConsecutiva,
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

  // Aproximación: los que cumplen más características
  const maxCount = Math.max(...scores.map((s) => s.count));
  const partial = scores.filter((s) => s.count === maxCount).map((s) => s.number);
  return { exact: [], partial, matchCount: maxCount };
}
