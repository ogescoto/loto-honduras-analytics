import { describe, it, expect } from "vitest";
import {
  LOTO_HN_SCHEDULES,
  gamesExpectedNow,
  HN_UTC_OFFSET,
} from "./schedules.js";

/** Crea un timestamp UTC dado una hora LOCAL Honduras (UTC-6). */
function hnLocal(day: number, hour: number, minute = 0): number {
  // Usamos 2026-06-22 (lunes) como fecha base para los tests de días
  // day 0=dom, 1=lun … 6=sáb
  const baseMonday = new Date("2026-06-22T00:00:00.000Z").getTime(); // lunes UTC
  const dayOffsetMs = ((day - 1 + 7) % 7) * 86_400_000; // 1=lun, 0=dom
  const localMs = baseMonday + dayOffsetMs + (hour * 60 + minute) * 60_000;
  // Convertir local→UTC (UTC = local - offset)
  return localMs - HN_UTC_OFFSET * 3_600_000;
}

describe("LOTO_HN_SCHEDULES", () => {
  it("tiene exactamente 13 juegos", () => {
    expect(LOTO_HN_SCHEDULES).toHaveLength(13);
  });

  it("solo super_premio tiene restricción de día (domingos)", () => {
    const withDays = LOTO_HN_SCHEDULES.filter((s) => s.days);
    expect(withDays).toHaveLength(1);
    expect(withDays[0]!.game).toBe("super_premio");
    expect(withDays[0]!.days).toEqual([0]);
  });

  it("todos tienen maxRetries=10, retryIntervalMin=10, restAfterFailMin=90", () => {
    for (const s of LOTO_HN_SCHEDULES) {
      expect(s.maxRetries).toBe(10);
      expect(s.retryIntervalMin).toBe(10);
      expect(s.restAfterFailMin).toBe(90);
    }
  });
});

describe("gamesExpectedNow", () => {
  it("detecta los 4 juegos de la franja 11 AM en un lunes", () => {
    // 11:35 HN (dentro de la ventana: primer intento a las 11:30)
    const nowUtc = hnLocal(1, 11, 35);
    const games = gamesExpectedNow(LOTO_HN_SCHEDULES, nowUtc, HN_UTC_OFFSET);
    const gameIds = games.map((g) => g.game);
    expect(gameIds).toContain("diaria_11am");
    expect(gameIds).toContain("pega3_11am");
    expect(gameIds).toContain("premia2_11am");
    expect(gameIds).toContain("juga3_11am");
    // No debe incluir los de 3 PM ni 9 PM
    expect(gameIds).not.toContain("diaria_3pm");
    expect(gameIds).not.toContain("diaria_9pm");
  });

  it("detecta los 4 juegos de la franja 3 PM en un miércoles", () => {
    const nowUtc = hnLocal(3, 15, 45); // 3:45 PM HN
    const games = gamesExpectedNow(LOTO_HN_SCHEDULES, nowUtc, HN_UTC_OFFSET);
    const gameIds = games.map((g) => g.game);
    expect(gameIds).toContain("diaria_3pm");
    expect(gameIds).toContain("pega3_3pm");
    expect(gameIds).not.toContain("super_premio"); // no es domingo
  });

  it("incluye super_premio solo en domingos a las 9 PM", () => {
    // Domingo 21:35 HN
    const domUtc = hnLocal(0, 21, 35);
    const gamesDom = gamesExpectedNow(LOTO_HN_SCHEDULES, domUtc, HN_UTC_OFFSET);
    expect(gamesDom.map((g) => g.game)).toContain("super_premio");

    // Lunes 21:35 HN → no debe aparecer
    const lunUtc = hnLocal(1, 21, 35);
    const gamesLun = gamesExpectedNow(LOTO_HN_SCHEDULES, lunUtc, HN_UTC_OFFSET);
    expect(gamesLun.map((g) => g.game)).not.toContain("super_premio");
  });

  it("no devuelve juegos antes del availableAfterMin (ventana aún no abierta)", () => {
    // 11:20 HN → 10 min antes del primer intento (ventana abre a 11:30)
    const nowUtc = hnLocal(1, 11, 20);
    const games = gamesExpectedNow(LOTO_HN_SCHEDULES, nowUtc, HN_UTC_OFFSET);
    const ids = games.map((g) => g.game);
    expect(ids).not.toContain("diaria_11am");
  });

  it("no devuelve juegos fuera de la ventana máxima total", () => {
    // La ventana de 11 AM termina a las 16:20 HN
    // (firstAttempt=11:30 + 10×10 + 90 + 10×10 = 290 min → 16:20 HN)
    // Verificamos que a las 16:25 HN ya no aparezca
    const nowUtc = hnLocal(1, 16, 25);
    const games = gamesExpectedNow(LOTO_HN_SCHEDULES, nowUtc, HN_UTC_OFFSET);
    const ids = games.map((g) => g.game);
    expect(ids).not.toContain("diaria_11am");
  });
});
