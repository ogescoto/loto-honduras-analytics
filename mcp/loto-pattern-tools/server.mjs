/**
 * MCP server — herramientas de configuración y evaluación de patrones.
 *
 * Expone al admin (y a agentes tipo opencode) tools para:
 *   - list_patterns        — lista los patrones actuales (config /catalog)
 *   - get_config           — devuelve el JSON de configuración interpretable
 *   - validate_config      — valida un JSON de configuración (estructura)
 *   - test_combo           — evalúa una combinación contra el histórico (hits)
 *   - candidates           — candidatos del próximo sorteo (filter)
 *
 * Protocolo: MCP sobre stdio (JSON-RPC). Zero dependencias runtime: usa fetch global.
 */
const API_BASE = process.env.LOTO_API_BASE ?? "https://api.pronosticos-hn.oged-solutions.com";
const TOKEN = process.env.LOTO_API_TOKEN ?? "";

// ── transport helpers ──────────────────────────────────────────────────────────
function send(msg) {
  process.stdout.write(JSON.stringify(msg) + "\n");
}

function json(id, result) {
  send({ jsonrpc: "2.0", id, result });
}
function jerr(id, code, message) {
  send({ jsonrpc: "2.0", id, error: { code, message } });
}

async function api(path, opts = {}) {
  const headers = { ...(opts.headers || {}) };
  if (TOKEN) headers["Authorization"] = `Bearer ${TOKEN}`;
  if (opts.body) headers["Content-Type"] = "application/json";
  const res = await fetch(`${API_BASE}${path}`, { ...opts, headers });
  return res.json();
}

// ── tools ──────────────────────────────────────────────────────────────────────
const TOOLS = [
  {
    name: "list_patterns",
    description: "Lista los patrones analíticos actuales (código, etiqueta, descripción, bloque).",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "get_config",
    description: "Devuelve la configuración de patrones actual (JSON interpretable: version, manual, bloques, patterns).",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "validate_config",
    description: "Valida un JSON de configuración de patrones (estructura y codes). Devuelve errores o 'OK'.",
    inputSchema: {
      type: "object",
      properties: {
        config: { type: "object", description: "Configuración con 'patterns[]' (code/label/description/block)." },
      },
      required: ["config"],
    },
  },
  {
    name: "test_combo",
    description: "Evalúa una combinación de patrones contra el histórico: cuántos sorteos habría acertado (efectividad).",
    inputSchema: {
      type: "object",
      properties: {
        game: { type: "string", description: "Juego, ej. diaria_11am." },
        features: { type: "array", items: { type: "string" }, description: "FeatureCodes (1-7)." },
        days: { type: "number", description: "Ventana de emulación 1-90 (def. 30)." },
      },
      required: ["game", "features"],
    },
  },
  {
    name: "candidates",
    description: "Devuelve los candidatos para el próximo sorteo que cumplen la combinación dada.",
    inputSchema: {
      type: "object",
      properties: {
        game: { type: "string", description: "Juego, ej. diaria_11am." },
        features: { type: "array", items: { type: "string" }, description: "FeatureCodes (1-7)." },
      },
      required: ["game", "features"],
    },
  },
];

async function callTool(id, name, args) {
  args = args || {};
  try {
    switch (name) {
      case "list_patterns": {
        const d = await api("/api/v1/features/catalog");
        json(id, { content: [{ type: "text", text: JSON.stringify(d.data ?? [], null, 2) }] });
        return;
      }
      case "get_config": {
        const d = await api("/api/v1/features/config");
        json(id, { content: [{ type: "text", text: JSON.stringify(d.data ?? {}, null, 2) }] });
        return;
      }
      case "validate_config": {
        const cfg = args.config;
        if (!cfg || !Array.isArray(cfg.patterns)) {
          json(id, { content: [{ type: "text", text: "Configuración inválida: falta 'patterns[]'." }] });
          return;
        }
        const bad = cfg.patterns.filter((p) => !p.code || !p.label || !p.description);
        json(id, {
          content: [{
            type: "text",
            text: bad.length
              ? `Configuración con errores: ${bad.length} patrones sin code/label/description.`
              : `OK: ${cfg.patterns.length} patrones válidos.`,
          }],
        });
        return;
      }
      case "test_combo": {
        const { game, features, days = 30 } = args;
        const d = await api(`/api/v1/features/${game}/hits`, {
          method: "POST",
          body: JSON.stringify({ features, days: Number(days) }),
        });
        if (!d.success) {
          json(id, { content: [{ type: "text", text: `Error: ${d.error?.message}` }] });
          return;
        }
        const r = d.data;
        const pct = r.evaluatedDraws ? Math.round((r.totalHits / r.evaluatedDraws) * 100) : 0;
        json(id, {
          content: [{
            type: "text",
            text: JSON.stringify({
              game, days, features,
              totalHits: r.totalHits,
              evaluatedDraws: r.evaluatedDraws,
              hitRatePct: pct,
              hits: r.hits.slice(0, 20),
            }, null, 2),
          }],
        });
        return;
      }
      case "candidates": {
        const { game, features } = args;
        const d = await api(`/api/v1/features/${game}/filter`, {
          method: "POST",
          body: JSON.stringify({ features }),
        });
        if (!d.success) {
          json(id, { content: [{ type: "text", text: `Error: ${d.error?.message}` }] });
          return;
        }
        json(id, {
          content: [{
            type: "text",
            text: JSON.stringify({ exact: d.data.exact, partial: d.data.partial, matchCount: d.data.matchCount }, null, 2),
          }],
        });
        return;
      }
      default:
        jerr(id, -32601, `Método desconocido: ${name}`);
    }
  } catch (err) {
    jerr(id, -32603, (err && err.message) || "error inesperado");
  }
}

// ── loop stdio ─────────────────────────────────────────────────────────────────
let buf = "";
const pending = new Set();
process.stdin.setEncoding("utf8");
process.stdin.on("data", (chunk) => {
  buf += chunk;
  const lines = buf.split("\n");
  buf = lines.pop() ?? "";
  for (const line of lines) {
    if (!line.trim()) continue;
    let msg;
    try { msg = JSON.parse(line); } catch { continue; }
    if (msg.method === "initialize") {
      json(msg.id, {
        protocolVersion: "2024-11-05",
        capabilities: { tools: { listChanged: false } },
        serverInfo: { name: "loto-pattern-tools", version: "1.0.0" },
      });
    } else if (msg.method === "notifications/initialized") {
      // no-op
    } else if (msg.method === "tools/list") {
      json(msg.id, { tools: TOOLS });
    } else if (msg.method === "tools/call") {
      const p = callTool(msg.id, msg.params?.name, msg.params?.arguments);
      pending.add(p);
      p.finally(() => pending.delete(p));
    } else if (msg.method === "ping") {
      json(msg.id, {});
    } else {
      jerr(msg.id, -32601, `Método no soportado: ${msg.method}`);
    }
  }
});
process.stdin.on("end", async () => {
  // Dejar que las llamadas async pendientes terminen antes de salir.
  const wait = async () => {
    while (pending.size) await Promise.allSettled([...pending]).then(() => new Promise((r) => setTimeout(r, 50)));
  };
  await Promise.race([wait(), new Promise((r) => setTimeout(r, 30_000))]);
  process.exit(0);
});