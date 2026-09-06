/**
 * Horarios de sorteos por lotería — fuente de verdad compartida.
 *
 * Copia local para el Worker de Cloudflare (no puede importar
 * desde scripts/ que está fuera del bundle del Worker).
 * El archivo canónico vive en scripts/ingest/schedules.ts.
 */

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface GameSchedule {
  game: string;
  lottery: string;
  drawHour: number;
  drawMinute: number;
  days?: DayOfWeek[];
  availableAfterMin: number;
  maxRetries: number;
  retryIntervalMin: number;
  restAfterFailMin: number;
}

export const HN_UTC_OFFSET = -6;

/**
 * Convierte el marcador de la fuente (04:00Z del día civil) al marcador canónico
 * del proyecto (10:00Z = 04:00 HN, mismo día). Suma 6 h (|offset HN|); nunca cruza
 * la medianoche civil, así el sorteo queda en su día calendario hondureño.
 */
export function sourceMarkerToCanonicalIso(sourceIso: string): string {
  return new Date(Date.parse(sourceIso) - HN_UTC_OFFSET * 3_600_000).toISOString();
}

const LOTO_HN_BASE: Omit<GameSchedule, "game" | "drawHour" | "drawMinute" | "days"> = {
  lottery: "loto_hn",
  availableAfterMin: 30,
  maxRetries: 10,
  retryIntervalMin: 10,
  restAfterFailMin: 90,
};

export const LOTO_HN_SCHEDULES: GameSchedule[] = [
  { ...LOTO_HN_BASE, game: "diaria_11am",  drawHour: 11, drawMinute: 0 },
  { ...LOTO_HN_BASE, game: "pega3_11am",   drawHour: 11, drawMinute: 0 },
  { ...LOTO_HN_BASE, game: "premia2_11am", drawHour: 11, drawMinute: 0 },
  { ...LOTO_HN_BASE, game: "juga3_11am",   drawHour: 11, drawMinute: 0 },
  { ...LOTO_HN_BASE, game: "diaria_3pm",   drawHour: 15, drawMinute: 0 },
  { ...LOTO_HN_BASE, game: "pega3_3pm",    drawHour: 15, drawMinute: 0 },
  { ...LOTO_HN_BASE, game: "premia2_3pm",  drawHour: 15, drawMinute: 0 },
  { ...LOTO_HN_BASE, game: "juga3_3pm",    drawHour: 15, drawMinute: 0 },
  { ...LOTO_HN_BASE, game: "diaria_9pm",   drawHour: 21, drawMinute: 0 },
  { ...LOTO_HN_BASE, game: "pega3_9pm",    drawHour: 21, drawMinute: 0 },
  { ...LOTO_HN_BASE, game: "premia2_9pm",  drawHour: 21, drawMinute: 0 },
  { ...LOTO_HN_BASE, game: "juga3_9pm",    drawHour: 21, drawMinute: 0 },
  // Super Premio: solo domingos
  { ...LOTO_HN_BASE, game: "super_premio", drawHour: 21, drawMinute: 0, days: [0] },
];
