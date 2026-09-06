import { describe, it, expect } from "vitest";
import { parseFeed } from "./parse-feed.js";
import { parseProxyList, pickProxy } from "./webshare.js";

describe("parseFeed", () => {
  it("resuelve el juego por _id y aplana score", () => {
    const draws = parseFeed({
      gameStats: [
        {
          _id: "693ae5bbd7b13e9daed23b13",
          game: { lastSession: { score: [["1"], ["2"], ["3"]], date: "2026-06-23T21:00:00.000Z" } },
          last_session_id: "sess-1",
        },
      ],
    });
    expect(draws).toHaveLength(1);
    expect(draws[0]!.game).toBe("pega3_9pm");
    expect(draws[0]!.numbers).toEqual(["1", "2", "3"]);
  });

  it("descarta entradas incompletas", () => {
    expect(parseFeed({ gameStats: [{ _id: "693ae5bbd7b13e9daed23b07" }] })).toEqual([]);
  });
});

describe("webshare list parsing", () => {
  it("parsea ip:puerto:user:pass y rota", () => {
    const list = parseProxyList("1.2.3.4:8000:u:p\n5.6.7.8:8001:u2:p2\n");
    expect(list).toHaveLength(2);
    expect(list[0]).toEqual({ host: "1.2.3.4", port: 8000, username: "u", password: "p" });
    expect(list).toContainEqual(pickProxy(list));
  });

  it("ignora líneas vacías o mal formadas", () => {
    expect(parseProxyList("\nbad-line\n9.9.9.9:80:u:p")).toHaveLength(1);
  });
});
