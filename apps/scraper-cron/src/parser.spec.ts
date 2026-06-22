import { describe, it, expect } from "vitest";
import { parseDraws, normalizeGame } from "./parser.js";

describe("normalizeGame", () => {
  it("mapea alias a GameType", () => {
    expect(normalizeGame("La Diaria")).toBe("diaria");
    expect(normalizeGame("PEGA 3")).toBe("pega3");
    expect(normalizeGame("desconocido")).toBeNull();
  });
});

describe("parseDraws (JSON)", () => {
  it("parsea un array JSON en inglés", () => {
    const raw = JSON.stringify([
      {
        game: "diaria",
        drawNumber: 10234,
        winningNumbers: [24],
        drawTimestamp: "2026-06-20T21:00:00Z",
      },
    ]);
    const draws = parseDraws(raw);
    expect(draws).toHaveLength(1);
    expect(draws[0]!.game).toBe("diaria");
    expect(draws[0]!.winningNumbers).toEqual([24]);
  });

  it("parsea claves en español y descarta entradas incompletas", () => {
    const raw = JSON.stringify([
      { juego: "pega 3", numeroSorteo: 5, numeros: [1, 2, 3], fecha: "2026-06-20" },
      { juego: "diaria" }, // incompleta -> descartada
    ]);
    const draws = parseDraws(raw);
    expect(draws).toHaveLength(1);
    expect(draws[0]!.game).toBe("pega3");
  });
});

describe("parseDraws (HTML fallback)", () => {
  it("extrae bloques data-*", () => {
    const html = `<div data-game="diaria" data-draw="999" data-date="2026-06-20T21:00:00Z" data-numbers="24"></div>`;
    const draws = parseDraws(html);
    expect(draws).toHaveLength(1);
    expect(draws[0]!.drawNumber).toBe(999);
  });

  it("devuelve [] si no hay coincidencias", () => {
    expect(parseDraws("<html>nada</html>")).toEqual([]);
  });
});
