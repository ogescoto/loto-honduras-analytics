/**
 * Tabla de horarios de cada juego por lotería.
 *
 * Diseñado para escalar a otras loterías (CR, GT, SV, etc.).
 * Cada entrada describe cuándo ocurre un sorteo y cuántos minutos
 * tarda en estar disponible en la API tras celebrarse.
 *
 * Convención de horas: hora LOCAL de la lotería (no UTC).
 * El campo `utcOffset` convierte a UTC para los crons.
 *
 * days: 0=domingo … 6=sábado; vacío o ausente = todos los días.
 */

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface GameSchedule {
  game: string;          // GameType — string para ser agnóstico de lotería
  lottery: string;       // identificador de lotería ("loto_hn", "loto_cr", …)
  drawHour: number;      // hora local en que se celebra el sorteo (0-23)
  drawMinute: number;    // minuto local
  days?: DayOfWeek[];    // días en que juega; undefined = todos los días
  /** Minutos de espera mínima tras el sorteo antes del primer intento */
  availableAfterMin: number;
  /** Máximo de reintentos cada `retryIntervalMin` minutos */
  maxRetries: number;
  /** Intervalo entre reintentos en minutos */
  retryIntervalMin: number;
  /** Minutos de descanso si los `maxRetries` fallan antes de volver a intentar */
  restAfterFailMin: number;
}

/** UTC-6 = Honduras */
export const HN_UTC_OFFSET = -6;

/**
 * Horarios oficiales de LOTO Honduras.
 *
 * Fuente verificada:  loteriasdehonduras.com
 *  - La Diaria, Pega 3, Premia 2, Jugá 3: 11 AM / 3 PM / 9 PM, todos los días.
 *  - Super Premio: domingo únicamente, a las 9 PM.
 *
 * availableAfterMin = 30  → los resultados aparecen ~30 min después del sorteo.
 * maxRetries = 10         → 10 intentos cada 10 min = hasta 100 min de ventana.
 * restAfterFailMin = 90   → si falla todo, descansar 90 min y reintentar el ciclo.
 */
const LOTO_HN_BASE: Omit<GameSchedule, "game" | "drawHour" | "drawMinute" | "days"> = {
  lottery: "loto_hn",
  availableAfterMin: 30,
  maxRetries: 10,
  retryIntervalMin: 10,
  restAfterFailMin: 90,
};

export const LOTO_HN_SCHEDULES: GameSchedule[] = [
  // ── 11 AM ──────────────────────────────────────────────────────
  { ...LOTO_HN_BASE, game: "diaria_11am",  drawHour: 11, drawMinute: 0 },
  { ...LOTO_HN_BASE, game: "pega3_11am",   drawHour: 11, drawMinute: 0 },
  { ...LOTO_HN_BASE, game: "premia2_11am", drawHour: 11, drawMinute: 0 },
  { ...LOTO_HN_BASE, game: "juga3_11am",   drawHour: 11, drawMinute: 0 },
  // ── 3 PM ───────────────────────────────────────────────────────
  { ...LOTO_HN_BASE, game: "diaria_3pm",   drawHour: 15, drawMinute: 0 },
  { ...LOTO_HN_BASE, game: "pega3_3pm",    drawHour: 15, drawMinute: 0 },
  { ...LOTO_HN_BASE, game: "premia2_3pm",  drawHour: 15, drawMinute: 0 },
  { ...LOTO_HN_BASE, game: "juga3_3pm",    drawHour: 15, drawMinute: 0 },
  // ── 9 PM ───────────────────────────────────────────────────────
  { ...LOTO_HN_BASE, game: "diaria_9pm",   drawHour: 21, drawMinute: 0 },
  { ...LOTO_HN_BASE, game: "pega3_9pm",    drawHour: 21, drawMinute: 0 },
  { ...LOTO_HN_BASE, game: "premia2_9pm",  drawHour: 21, drawMinute: 0 },
  { ...LOTO_HN_BASE, game: "juga3_9pm",    drawHour: 21, drawMinute: 0 },
  // ── Super Premio: solo domingos 9 PM ───────────────────────────
  { ...LOTO_HN_BASE, game: "super_premio", drawHour: 21, drawMinute: 0, days: [0] },
];

/**
 * Todas las loterías registradas (punto de extensión).
 * Para agregar una nueva lotería: importar sus schedules y concatenar aquí.
 */
export const ALL_SCHEDULES: GameSchedule[] = [
  ...LOTO_HN_SCHEDULES,
  // ...LOTO_CR_SCHEDULES,  (futuro)
  // ...LOTO_GT_SCHEDULES,  (futuro)
];

/**
 * Devuelve los juegos que deberían tener resultados disponibles en este momento,
 * dado un timestamp UTC en ms. Se usa para filtrar qué juegos intentar en cada
 * ejecución del cron.
 *
 * Un juego "debería estar disponible" si:
 *   - Hoy es un día en que juega (o juega todos los días).
 *   - La hora actual UTC está DESPUÉS de (drawHour:drawMinute + availableAfterMin)
 *     pero ANTES de (drawHour:drawMinute + availableAfterMin + maxRetries*retryIntervalMin + restAfterFailMin + margen).
 */
export function gamesExpectedNow(
  schedules: GameSchedule[],
  nowUtcMs: number,
  utcOffset: number,
): GameSchedule[] {
  const nowDate = new Date(nowUtcMs);
  // Hora local de Honduras
  const localMs = nowUtcMs + utcOffset * 60 * 60 * 1000;
  const localDate = new Date(localMs);
  const localDay = localDate.getUTCDay() as DayOfWeek;
  const localHour = localDate.getUTCHours();
  const localMinute = localDate.getUTCMinutes();
  const localMinOfDay = localHour * 60 + localMinute;

  return schedules.filter((s) => {
    // ¿Juega hoy?
    if (s.days && !s.days.includes(localDay)) return false;

    const drawMinOfDay = s.drawHour * 60 + s.drawMinute;
    const firstAttempt = drawMinOfDay + s.availableAfterMin;
    // Ventana máxima: reintentos + descanso + un ciclo más de reintentos
    const windowEnd = firstAttempt + s.maxRetries * s.retryIntervalMin + s.restAfterFailMin + s.maxRetries * s.retryIntervalMin;

    return localMinOfDay >= firstAttempt && localMinOfDay < windowEnd;
  });
}
