import { describe, it, expect } from "vitest";
import {
  computeNumberStates,
  filterByFeatures,
  findExclusiveConflict,
  type FeatureCode,
} from "./features-engine.js";

const NOW = new Date("2026-06-20T00:00:00Z");

function draw(daysAgo: number, nums: string[]): { numbers: string[]; drawDate: Date } {
  return { numbers: nums, drawDate: new Date(NOW.getTime() - daysAgo * 86_400_000) };
}

describe("computeNumberStates — catálogo extendido", () => {
  it("calcula pareja_100 como complemento del último ganador global", () => {
    // Último ganador (familia): 73 → pareja_100 = 27.
    const family = [
      draw(1, ["73", "12"]),  // más reciente (hace 1 día)
      draw(2, ["05"]),
      draw(3, ["44"]),
    ];
    const states = computeNumberStates(family, family, family, NOW);
    const s27 = states.find((s) => s.number === 27)!;
    const s73 = states.find((s) => s.number === 73)!;
    expect(s27.features.pareja_100).toBe(true);
    expect(s73.features.pareja_100).toBe(false);
  });

  it("calcula vecino_ganador (±1 del último ganador)", () => {
    const family = [draw(1, ["52"])];
    const states = computeNumberStates(family, family, family, NOW);
    expect(states[51]!.features.vecino_ganador).toBe(true);
    expect(states[53]!.features.vecino_ganador).toBe(true);
    expect(states[52]!.features.vecino_ganador).toBe(false);
  });

  it("calcula raiz_digitos_ganador (suma de dígitos del último ganador)", () => {
    // 45 → 4+5 = 09.
    const family = [draw(1, ["45"])];
    const states = computeNumberStates(family, family, family, NOW);
    expect(states[9]!.features.raiz_digitos_ganador).toBe(true);
    expect(states[10]!.features.raiz_digitos_ganador).toBe(false);
  });

  it("marca presencia_corta solo si salió en los últimos 5 días", () => {
    const family = [
      draw(1, ["10"]),   // reciente → presencia corta
      draw(20, ["10"]),  // histórico
      draw(30, ["20"]),  // nunca reciente
    ];
    const states = computeNumberStates(family, family, family, NOW);
    expect(states[10]!.features.presencia_corta).toBe(true);
    expect(states[20]!.features.presencia_corta).toBe(false);
  });

  it("detecta terminacion_fria (la menos frecuente de las últimas 15 jugadas)", () => {
    // 14 sorteos terminan en 0 y solo 1 termina en 1 → la terminación 1 es fría.
    const family = [];
    for (let i = 1; i <= 14; i++) family.push(draw(i, [String((i * 10) % 100).padStart(2, "0")]));
    family.push(draw(15, ["01"]));
    const states = computeNumberStates(family, family, family, NOW);
    // Todos los números terminados en 1 son fríos.
    expect(states[1]!.features.terminacion_fria).toBe(true);
    expect(states[31]!.features.terminacion_fria).toBe(true);
    expect(states[0]!.features.terminacion_fria).toBe(false);
  });
});

describe("filterByFeatures", () => {
  it("devuelve exact cuando alguien cumple todas", () => {
    // Estado construido a mano con dos features.
    const states = Array.from({ length: 100 }, (_, num) => ({
      number: num,
      features: {
        pareja_100: num === 27,
        sobredemora: num === 27,
      } as Record<FeatureCode, boolean>,
      daysSinceLastGlobal: 0,
      daysSinceLastInSlot: 0,
      countLast10Days: 0,
    }));
    const res = filterByFeatures(states, ["pareja_100", "sobredemora"]);
    expect(res.exact).toEqual([27]);
  });
});

describe("findExclusiveConflict — clasificación excluyente", () => {
  it("detecta dos patrones de la misma clasificación (decena)", () => {
    const conflict = findExclusiveConflict(["cluster_decena_activa", "decena_top_100", "docena_activa"]);
    expect(conflict).not.toBeNull();
    expect(conflict!.category).toBe("decena");
    expect(conflict!.codes).toContain("cluster_decena_activa");
    expect(conflict!.codes).toContain("decena_top_100");
  });

  it("permite combinar patrones de distinta clasificación", () => {
    expect(findExclusiveConflict(["cluster_decena_activa", "docena_activa", "terminacion_caliente"])).toBeNull();
  });

  it("permite una sola característica", () => {
    expect(findExclusiveConflict(["pareja_100"])).toBeNull();
  });
});
