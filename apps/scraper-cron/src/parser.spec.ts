import { describe, it, expect } from "vitest";
import { sourceMarkerToCanonicalIso } from "./schedules.js";
import {
  gameFromSiteId,
  gameFromTitle,
  parseRawRecords,
  parseFeed,
  collectLayoutIds,
  flattenScore,
  parseSiteGameSessions,
  findDrawForSlot,
} from "./parser.js";

describe("gameFromSiteId", () => {
  it("resuelve el juego por siteGameId (discriminador fiable)", () => {
    expect(gameFromSiteId("693ae5bbd7b13e9daed23b07")).toBe("diaria_3pm");
    expect(gameFromSiteId("693ae5bbd7b13e9daed23b19")).toBe("super_premio");
    expect(gameFromSiteId("desconocido")).toBeNull();
  });
});

describe("gameFromTitle (respaldo)", () => {
  it("deriva familia + horario del título", () => {
    expect(gameFromTitle("La Diaria 3:00 PM")).toBe("diaria_3pm");
    expect(gameFromTitle("Pega 3 11:00 AM")).toBe("pega3_11am");
    expect(gameFromTitle("Jugá 3 9:00 PM")).toBe("juga3_9pm");
    expect(gameFromTitle("Super Premio Loto")).toBe("super_premio");
  });

  it("devuelve null si falta horario en familias con horario", () => {
    expect(gameFromTitle("La Diaria")).toBeNull();
    expect(gameFromTitle("Algo raro")).toBeNull();
  });
});

describe("parseRawRecords (Data/raw)", () => {
  it("mapea por siteGameId y conserva números/signos como texto", () => {
    const draws = parseRawRecords([
      {
        siteGameId: "693ae5bbd7b13e9daed23b07",
        juego: "La Diaria",
        horario: "11:00 AM", // no fiable: se ignora
        fecha: "2026-06-22T04:00:00.000Z",
        numeros: ["00", "JG", "9"],
        signos: ["00 Avión", "JG", "9"],
        sessionId: "abc123",
      },
    ]);
    expect(draws).toHaveLength(1);
    expect(draws[0]!.game).toBe("diaria_3pm");
    expect(draws[0]!.numbers).toEqual(["00", "JG", "9"]);
    expect(draws[0]!.signs).toEqual(["00 Avión", "JG", "9"]);
    expect(draws[0]!.sessionId).toBe("abc123");
  });

  it("descarta registros sin juego resoluble, sin sessionId o sin fecha", () => {
    const draws = parseRawRecords([
      { siteGameId: "id-desconocido", numeros: ["1"], sessionId: "x", fecha: "2026-06-01" },
      { siteGameId: "693ae5bbd7b13e9daed23b07", numeros: ["1"] }, // sin sessionId/fecha
    ]);
    expect(draws).toEqual([]);
  });

  it("tolera signos ausentes (Premia 2 / Super Premio)", () => {
    const draws = parseRawRecords([
      {
        siteGameId: "693ae5bbd7b13e9daed23b25",
        fecha: "2026-06-23T04:00:00.000Z",
        numeros: ["12", "35"],
        sessionId: "p2",
      },
    ]);
    expect(draws[0]!.signs).toEqual([]);
    expect(draws[0]!.game).toBe("premia2_3pm");
  });
});

describe("parseFeed (API /feed/game-stats)", () => {
  it("aplana score y resuelve el juego por _id", () => {
    const body = {
      gameStats: [
        {
          _id: "693ae5bbd7b13e9daed23b13",
          title: "Pega 3 9:00 PM",
          game: { lastSession: { score: [["1"], ["2"], ["3"]], date: "2026-06-23T21:00:00.000Z" } },
          last_session_id: "sess-1",
        },
      ],
    };
    const draws = parseFeed(body);
    expect(draws).toHaveLength(1);
    expect(draws[0]!.game).toBe("pega3_9pm");
    expect(draws[0]!.numbers).toEqual(["1", "2", "3"]);
    expect(draws[0]!.sessionId).toBe("sess-1");
  });

  it("acepta string JSON y descarta entradas incompletas", () => {
    const raw = JSON.stringify({
      gameStats: [
        { _id: "693ae5bbd7b13e9daed23b07", last_session_id: "s" }, // sin score/date
      ],
    });
    expect(parseFeed(raw)).toEqual([]);
  });
});

describe("collectLayoutIds / flattenScore", () => {
  it("resuelve ids incluso con score_layout doble-anidado", () => {
    const layout = [
      [
        { options: [{ id: "idA", text: "44 Mesas" }, { id: "idB", text: "2X" }] },
        { options: [{ id: "idC", text: "8" }] },
      ],
    ];
    const map = collectLayoutIds(layout);
    expect(map.get("idA")).toBe("44 Mesas");
    expect(map.get("idB")).toBe("2X");
    expect(map.get("idC")).toBe("8");
  });

  it("aplana scores anidados y descarta vacíos", () => {
    expect(flattenScore([["1"], [], ["2", "3"]])).toEqual(["1", "2", "3"]);
  });
});

describe("parseSiteGameSessions (/site-games)", () => {
  it("resuelve La Diaria: numbers = primer token, signs = texto completo", () => {
    const doc = {
      game: {
        score_layout: [
          {
            options: [
              { id: "idA", text: "44 Mesas" },
              { id: "idX", text: "2X" },
              { id: "idC", text: "8" },
            ],
          },
        ],
        sessions: [
          {
            _id: "sess1",
            date: "2026-09-04T04:00:00.000Z",
            score: [["idA", "idX", "idC"]],
          },
        ],
      },
    };
    const draws = parseSiteGameSessions("693ae5bbd7b13e9daed23b31", doc);
    expect(draws).toHaveLength(1);
    expect(draws[0]!.game).toBe("diaria_11am");
    expect(draws[0]!.numbers).toEqual(["44", "2X", "8"]);
    expect(draws[0]!.signs).toEqual(["44 Mesas", "2X", "8"]);
    expect(draws[0]!.sessionId).toBe("sess1");
  });

  it("devuelve vacío si el siteGameId no es válido o faltan datos", () => {
    expect(parseSiteGameSessions("id-desconocido", { game: {} })).toEqual([]);
    expect(
      parseSiteGameSessions("693ae5bbd7b13e9daed23b31", { game: { sessions: [{ _id: "x" }] } }),
    ).toEqual([]);
  });

  it("números directos cuando no hay signos (Pega 3)", () => {
    const doc = {
      game: {
        sessions: [
          { _id: "s2", date: "2026-09-04T04:00:00.000Z", score: [["64", "34", "65"]] },
        ],
      },
    };
    const draws = parseSiteGameSessions("693ae5bbd7b13e9daed23b37", doc);
    expect(draws[0]!.numbers).toEqual(["64", "34", "65"]);
    expect(draws[0]!.signs).toEqual([]);
  });
});

describe("findDrawForSlot", () => {
  it("elige el sorteo cuyo marcador coincide con el día objetivo", () => {
    const draws = [
      { game: "diaria_11am" as const, sessionId: "s-a", numbers: ["1"], signs: [], drawDate: "2026-09-03T04:00:00.000Z" },
      { game: "diaria_11am" as const, sessionId: "s-b", numbers: ["2"], signs: [], drawDate: "2026-09-04T04:00:00.000Z" },
    ];
    const target = Date.parse("2026-09-04T04:00:00.000Z");
    expect(findDrawForSlot(draws, target)?.sessionId).toBe("s-b");
    expect(findDrawForSlot(draws, Date.parse("2026-09-05T04:00:00.000Z"))).toBeUndefined();
  });
});

describe("sourceMarkerToCanonicalIso — zona horaria Honduras (GMT-6)", () => {
  it("convierte el marcador 04:00Z de la fuente al 10:00Z canónico sin cruzar de día", () => {
    // 11 AM del 5 sep HN: la fuente lo reporta como 04:00Z. Debe quedar en el MISMO
    // día civil (10:00Z = 04:00 HN), no desplazado al día anterior.
    const out = sourceMarkerToCanonicalIso("2026-09-05T04:00:00.000Z");
    expect(out).toBe("2026-09-05T10:00:00.000Z");
    expect(new Date(out).getUTCDate()).toBe(5); // mismo día calendario
  });

  it("cruzar la medianoche civil (22:00Z del día previo) queda dentro del día correcto", () => {
    // Caso límite: marcador del día 1 → no debe quedar en el día 0.
    const out = sourceMarkerToCanonicalIso("2026-09-01T04:00:00.000Z");
    expect(out).toBe("2026-09-01T10:00:00.000Z");
    expect(new Date(out).getUTCDate()).toBe(1);
  });
});
