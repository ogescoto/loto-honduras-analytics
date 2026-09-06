# MCP — Patrones (loto-pattern-tools)

Servidor MCP (Model Context Protocol sobre stdio, JSON-RPC) que expone al **admin** herramientas para **configurar y evaluar** patrones analíticos sin tocar la UI. Zero dependencias runtime (usa `fetch` global de Node ≥ 20).

## Instalación

```bash
pnpm --dir mcp/loto-pattern-tools install   # no hay deps; prepara bin
chmod +x mcp/loto-pattern-tools/server.mjs # si aplica
```

Variables de entorno opcionales:
- `LOTO_API_BASE` — base de la API (def. `https://api.pronosticos-hn.oged-solutions.com`).
- `LOTO_API_TOKEN` — token JWT (solo si se requieren rutas autenticadas; el motor `/features` es público).

## Herramientas

| Tool | Entrada | Salida |
|---|---|---|
| `list_patterns` | — | Catálogo actual (`/features/catalog`) |
| `get_config` | — | JSON de configuración (`/features/config`): manual, bloques, patterns |
| `validate_config` | `{ config }` | Valida estructura de `config.patterns[]` |
| `test_combo` | `{ game, features[], days? }` | Efectividad histórica: totalHits/evaluatedDraws/hitRatePct + hits |
| `candidates` | `{ game, features[] }` | Candidatos del próximo sorteo (`/filter`) |

## Uso desde opencode/agente

Añade al `opencode.json` del proyecto:

```jsonc
{
  "mcpServers": {
    "loto-pattern-tools": {
      "command": "node",
      "args": ["mcp/loto-pattern-tools/server.mjs"]
    }
  }
}
```

## Flujo típico (admin)

1. `list_patterns` / `get_config` → ver lo existente.
2. Editar el JSON de configuración (pantalla `/configuracion` o por MCP: `validate_config`).
3. `test_combo` con `{ game, features, days }` → medir efectividad.
4. `candidates` → ver candidatos del próximo sorteo.
5. Publicar cambios del motor en `apps/backend-hono/src/patterns/features-engine.ts` (nuevos FeatureCode) y desplegar, o persistir combinaciones como `saved-patterns` por usuario.