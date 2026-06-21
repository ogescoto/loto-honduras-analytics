---
tipo: modulo
modulo: scraper-ingestion
estado: activo
actualizado: 2026-06-21
---

# Módulo: Scraper · Ingestión de sorteos

[[00_MAPA_DE_CONTENIDOS|Mapa de Contenidos]]

## Responsabilidad
Mantener actualizado el histórico de sorteos descargando periódicamente los resultados oficiales y persistiéndolos de forma idempotente. Es un **Cloudflare Scheduled Worker**.

## Lenguaje ubicuo
- **Sorteo (LotteryDraw), tipo de juego:** ver [[01_Dominio/Glosario|Glosario]].

## Dependencias
- **Scrapoxy** (proxy rotativo, Docker) para evitar bloqueos por reputación de IP.
- Fuente oficial de la Lotería de Honduras (`LOTERIA_SOURCE_URL`).
- `packages/shared-types` (`GameType`; tipo local `ParsedDraw`).
- Neon / Postgres (tabla `lottery_history`).

## API pública
- **Disparador:** handler `scheduled(event, env, ctx)` en `apps/scraper-cron/src/index.ts` (cron **22:00 UTC**, configurado en `wrangler.toml`).
- **Orquestación:** `runScrape(env)` → `fetchSource` (fetch a `LOTERIA_SOURCE_URL`) → `parseDraws` → `persist` (upsert).
- **Parser:** `parseDraws(raw)` en `apps/scraper-cron/src/parser.ts` → `ParsedDraw[]`. Soporta **JSON** (claves en inglés y español: `game/juego`, `drawNumber/numeroSorteo`, `winningNumbers/numeros`, `drawTimestamp/fecha`) y **fallback HTML** por regex sobre atributos `data-*`. `normalizeGame` mapea alias de juego al enum `GameType`.
- **Persistencia:** insert con `onConflictDoNothing({ target: drawNumber })` — upsert idempotente.

## Entidades principales
- [[01_Dominio/Entidades#LotteryDraw|LotteryDraw / lottery_history]] — `drawNumber` único garantiza idempotencia.

## Decisiones técnicas relevantes
- [[02_Arquitectura/adr/0002-arquitectura-edge-cloudflare|ADR-0002]]: cron worker en el edge; Scrapoxy para la ingestión.

## Flujos relacionados
- [[05_Procesos/Flujo_Ingestion_Scraping|Ingestión periódica vía scraping]].

## Protección
- Estado en `.aicodeprotect.yml`: **no protegido** (salvo migraciones bajo `apps/**/migrations/**`, que sí lo están).

## Pendiente / no documentado
- El **markup HTML real** del sitio aún debe confirmarse: el fallback espera atributos `data-*` y se ajustará cuando se conozca la fuente.
- En Workers no hay agente HTTP configurable, por lo que el enrutamiento por **Scrapoxy** se aplica a nivel de red/infra, no en el `fetch`.
- No hay reintentos/backoff ante fallos de la fuente (hoy se registra el error y se omite el ciclo).

## Historial de cambios
- 2026-06-21: implementación real documentada — `parseDraws` (JSON + fallback HTML, `normalizeGame`), `runScrape` con fetch a `LOTERIA_SOURCE_URL`, upsert idempotente (`onConflictDoNothing` sobre `draw_number`) y cron 22:00 UTC. Estado pasa a activo; resuelto el pendiente de andamiaje.
- 2026-06-20: creación inicial (estado andamiaje).
