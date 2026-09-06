import { describe, it, expect } from "vitest";
import {
  hotCold,
  inverseStreaks,
  parity,
  crossMetaPatterns,
  withinWindow,
  toNumericTokens,
  type DrawRecord,
} from "./engine.js";
import { numberForDream } from "./dream-guide.js";

const NOW = new Date("2026-06-20T00:00:00Z");

function draw(daysAgo: number, nums: string[], id = "s"): DrawRecord {
  return {
    sessionId: `${id}-${daysAgo}`,
    numbers: nums,
    drawDate: new Date(NOW.getTime() - daysAgo * 86_400_000),
  };
}

const sample: DrawRecord[] = [
  draw(1, ["24"]),
  draw(2, ["24"]),
  draw(3, ["8"]),
  draw(40, ["24"]), // fuera de ventana 30d
  draw(100, ["13"]),
];

describe("toNumericTokens", () => {
  it("descarta comodines y normaliza '00'", () => {
    expect(toNumericTokens(["00", "JG", "2X", "9"])).toEqual([0, 9]);
    expect(toNumericTokens(["07", "71"])).toEqual([7, 71]);
  });
});

describe("withinWindow", () => {
  it("filtra por ventana de días", () => {
    expect(withinWindow(sample, 30, NOW)).toHaveLength(3);
  });
});

describe("hotCold", () => {
  it("identifica el número más caliente en 30 días", () => {
    const hc = hotCold(sample, 30, 3, NOW);
    expect(hc.hot[0]!.number).toBe(24);
    expect(hc.hot[0]!.count).toBe(2);
  });
});

describe("inverseStreaks", () => {
  it("prioriza números más atrasados", () => {
    const streaks = inverseStreaks(sample, 99, 3);
    // 24 salió en el sorteo más reciente -> racha 0; debe NO ser el top.
    expect(streaks[0]!.drawsSinceLastSeen).toBeGreaterThan(0);
  });
});

describe("parity", () => {
  it("calcula ratio par/impar", () => {
    const p = parity([draw(1, ["2", "4", "3"])]);
    expect(p.even).toBe(2);
    expect(p.odd).toBe(1);
    expect(p.evenRatio).toBeCloseTo(2 / 3);
  });
});

describe("crossMetaPatterns", () => {
  it("eleva a meta-patrón un número caliente que coincide con un sueño", () => {
    const hot = hotCold(sample, 30, 5, NOW).hot;
    const fuego = numberForDream("fuego"); // 24
    const metas = crossMetaPatterns(hot, [fuego!]);
    expect(metas).toHaveLength(1);
    expect(metas[0]!.targetNumbers).toEqual([24]);
    expect(metas[0]!.confidenceScore).toBe("100.0%");
  });

  it("no cruza si el sueño no está caliente", () => {
    const hot = hotCold(sample, 30, 5, NOW).hot;
    expect(crossMetaPatterns(hot, [99])).toHaveLength(0);
  });
});
