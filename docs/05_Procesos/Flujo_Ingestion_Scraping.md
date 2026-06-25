---
tipo: proceso
estado: activo
actualizado: 2026-06-23
---

# Flujo: Ingestión periódica vía scraping

[[00_MAPA_DE_CONTENIDOS|Mapa de Contenidos]]

Caso de uso [[01_Dominio/Casos_de_Uso#CU-04|CU-04]]. Cómo el [[04_Modulos/Scraper_Ingestion|scraper-cron]] alimenta el histórico de sorteos.

## Actor
- Sistema (Cloudflare Scheduled Worker), gateway de Decodo, fuente oficial.

## Secuencia
```mermaid
sequenceDiagram
  participant CR as scraper-cron (cron)
  participant DX as Gateway Decodo
  participant SRC as Fuente Lotería HN
  participant DB as Neon (lottery_history)
  CR->>DX: fetchViaDecodo() — fetch al gateway (Proxy-Authorization + X-Target-Url)
  DX->>SRC: petición con IP rotativa del pool
  SRC-->>DX: HTML/JSON de sorteos
  DX-->>CR: respuesta
  CR->>CR: parseDraws() -> ParsedDraw[] (JSON o fallback HTML)
  CR->>DB: insert ... onConflictDoNothing(drawNumber) (upsert idempotente)
```

## Reglas
- **Disparo:** cron **22:00 UTC** (`wrangler.toml`) → `scheduled` → `runScrape`.
- **Salida por proxy:** `fetchViaDecodo` enruta la petición por el gateway de Decodo (en el runtime de Workers no se puede pasar `agent`/`proxy` a `fetch`). Ver [[02_Arquitectura/adr/0004-proxy-scraping-via-decodo|ADR-0004]].
- **Parseo:** `parseDraws` admite JSON (claves EN/ES) y fallback HTML por atributos `data-*`; `normalizeGame` mapea alias a `GameType`. Solo se persisten sorteos con todos los campos válidos.
- **Idempotencia:** `drawNumber` es único; el `onConflictDoNothing` evita duplicar al reingestar.
- Tras la ingestión, los datos quedan disponibles para recalcular [[04_Modulos/Patrones|patrones]].

## Pendiente
- Confirmar el **markup HTML real** de la fuente (el fallback `data-*` es provisional) y añadir reintentos/backoff. Ver [[04_Modulos/Scraper_Ingestion|módulo]].

## Historial de cambios
- 2026-06-23: proxy migrado de Scrapoxy a **Decodo** (gateway gestionado); el `fetch` ahora sale por el proxy (`fetchViaDecodo`). Actualizados actor y diagrama. Ver [[02_Arquitectura/adr/0004-proxy-scraping-via-decodo|ADR-0004]].
- 2026-06-21: implementación real — fetch a `LOTERIA_SOURCE_URL`, parseo JSON/HTML y upsert idempotente; cron 22:00 UTC. Estado activo; resuelto el pendiente de andamiaje.
- 2026-06-20: creación inicial (estado andamiaje).
