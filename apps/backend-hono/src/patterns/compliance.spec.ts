import { describe, it, expect } from "vitest";
import {
  computeWinnerCompliance,
  lastHits,
  topFeatureCombos,
  MAX_EVALUATED_DRAWS,
  MAX_RETURNED_HITS,
  type Draw,
} from "./compliance.js";

const T = Date.parse("2026-06-20T00:00:00Z");
const DAY = 86_400_000;

function d(game: string, sessionId: string, daysAgo: number, nums: string[]): Draw {
  return { game, sessionId, numbers: nums, drawDate: T - daysAgo * DAY };
}

describe("computeWinnerCompliance — cumplimiento histórico de ganadores", () => {
  it("reporta acierto cuando el ganador cumplía pareja_100 del último ganador global", () => {
    const familyDraws = [
      d("diaria_9pm", "s9", 2, ["73"]),
      d("diaria_11am", "s11", 1, ["27"]), // 27 = 100 − 73, sorteo posterior
    ];
    const slotDraws = [familyDraws[1]!];

    const hits = computeWinnerCompliance(["pareja_100"], familyDraws, slotDraws);

    expect(hits).toHaveLength(1);
    expect(hits[0]!.sessionId).toBe("s11");
    expect(hits[0]!.matchedNumbers).toEqual([27]);
  });

  it("solo evalúa los sorteos del juego seleccionado (no la familia completa)", () => {
    const familyDraws = [
      d("diaria_3pm", "s3", 2, ["73"]),
      d("diaria_11am", "s11", 1, ["27"]),
      d("diaria_9pm", "s9", 1, ["27"]), // mismo día, otra jornada: no es candidato
    ];
    const slotDraws = [familyDraws[1]!];

    const hits = computeWinnerCompliance(["pareja_100"], familyDraws, slotDraws);

    expect(hits).toHaveLength(1);
    expect(hits[0]!.sessionId).toBe("s11");
  });

  it("reconstruye el estado ANTES del sorteo (excluye el sorteo mismo)", () => {
    // Primer sorteo del historial: 44 jamás salió antes → eco_consecutivo falso.
    const familyDraws = [d("diaria_11am", "s11", 2, ["44"])];

    const hits = computeWinnerCompliance(["eco_consecutivo"], familyDraws, familyDraws);

    expect(hits).toHaveLength(0);
  });

  it("exige TODAS las características de la combinación", () => {
    const familyDraws = [
      d("diaria_9pm", "s9", 2, ["45"]),
      d("diaria_11am", "s11", 1, ["55"]), // 55 = pareja de 45 y dígitos gemelos
    ];
    const slotDraws = [familyDraws[1]!];

    const hits = computeWinnerCompliance(
      ["pareja_100", "digitos_gemelos"],
      familyDraws,
      slotDraws,
    );

    expect(hits).toHaveLength(1);
    expect(hits[0]!.matchedNumbers).toEqual([55]);

    // Agregar una característica que no se cumple → deja de ser acierto.
    const noHits = computeWinnerCompliance(
      ["pareja_100", "digitos_gemelos", "caliente_cortoplazo"],
      familyDraws,
      slotDraws,
    );
    expect(noHits).toHaveLength(0);
  });

  it("respeta la ventana de MAX_EVALUATED_DRAWS (no evalúa sorteos más antiguos)", () => {
    const slotDraws: Draw[] = [];
    const familyDraws: Draw[] = [d("diaria_9pm", "sprev", 125, ["91"])]; // aún más antiguo
    for (let i = 0; i <= MAX_EVALUATED_DRAWS; i++) {
      const s = d("diaria_11am", `s${i}`, 122 - i, [String(10 + (i % 80)).padStart(2, "0")]);
      slotDraws.push(s);
      familyDraws.push(s);
    }
    slotDraws[0]!.numbers = ["91"]; // el más antiguo: acierto eco si se evaluara, pero queda fuera de la ventana

    const hits = computeWinnerCompliance(["eco_consecutivo"], familyDraws, slotDraws);

    expect(slotDraws).toHaveLength(MAX_EVALUATED_DRAWS + 1);
    // Ningún sorteo dentro de la ventana tiene ganador repetido consecutivamente → 0 hits.
    expect(hits).toHaveLength(0);
  });

  it("acota a MAX_RETURNED_HITS y devuelve en orden cronológico", () => {
    const slotDraws: Draw[] = [];
    const familyDraws: Draw[] = [];
    for (let i = 0; i < MAX_RETURNED_HITS + 10; i++) {
      const s = d("diaria_11am", `s${i}`, i + 1, ["05", "10"]); // múltiplos de 5 siempre
      slotDraws.push(s);
      familyDraws.push(s);
    }

    const hits = computeWinnerCompliance(["multiplo_base_cinco"], familyDraws, slotDraws);

    expect(hits).toHaveLength(MAX_RETURNED_HITS);
    expect(hits[0]!.sessionId).toBe(`s${MAX_RETURNED_HITS - 1}`); // el más antiguo de la ventana
    expect(hits[MAX_RETURNED_HITS - 1]!.sessionId).toBe("s0");    // el más reciente
  });

  it("lastHits es equivalente a computeWinnerCompliance", () => {
    const familyDraws = [
      d("diaria_9pm", "s9", 1, ["73"]),
      d("diaria_11am", "s11", 2, ["27"]),
    ];
    const slotDraws = [familyDraws[1]!];

    expect(lastHits(["pareja_100"], familyDraws, slotDraws)).toEqual(
      computeWinnerCompliance(["pareja_100"], familyDraws, slotDraws),
    );
  });

  it("topFeatureCombos cuenta combinaciones presentes en varios sorteos", () => {
    // 3 sorteos con ganador 52: los ganadores repetidos activan eco_consecutivo.
    const familyDraws = [
      d("diaria_11am", "s1", 5, ["52"]),
      d("diaria_11am", "s2", 4, ["52"]),
      d("diaria_11am", "s3", 3, ["52"]),
      d("diaria_11am", "s4", 2, ["44"]),
      d("diaria_11am", "s5", 1, ["52"]),
    ];
    const res = topFeatureCombos(familyDraws, familyDraws, { k: 1, maxDraws: 10, topN: 25 });

    expect(res.evaluatedDraws).toBe(5);
    expect(Array.isArray(res.combos)).toBe(true);
    // Ordenadas por count desc.
    for (let i = 1; i < res.combos.length; i++) {
      expect(res.combos[i]!.count).toBeLessThanOrEqual(res.combos[i - 1]!.count);
    }
    // 52 se repite en s2 y s3 → eco_consecutivo debe estar en el top.
    const hasEco = res.combos.some((c) => c.features.includes("eco_consecutivo"));
    expect(hasEco).toBe(true);
  });
});