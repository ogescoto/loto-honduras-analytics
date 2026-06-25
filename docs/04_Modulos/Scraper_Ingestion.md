---
tipo: modulo
modulo: scraper-ingestion
estado: activo
actualizado: 2026-06-23
---

# Módulo: Scraper · Ingestión de sorteos

[[00_MAPA_DE_CONTENIDOS|Mapa de Contenidos]]

## Responsabilidad
Mantener actualizado el histórico de sorteos descargando periódicamente los resultados oficiales y persistiéndolos de forma idempotente. Es un **Cloudflare Scheduled Worker**.

## Lenguaje ubicuo
- **Sorteo (LotteryDraw), tipo de juego:** ver [[01_Dominio/Glosario|Glosario]].

## Dependencias
- **Decodo** (gateway de proxy rotativo, servicio externo gestionado — **NO dockerizado**) para evitar bloqueos por reputación de IP. Credenciales por secreto: `DECODO_PROXY_HOST`, `DECODO_PROXY_PORT`, `DECODO_PROXY_USERNAME`, `DECODO_PROXY_PASSWORD`.
- Fuente oficial de la Lotería de Honduras (`LOTERIA_SOURCE_URL`).
- `packages/shared-types` (`GameType`; tipo local `ParsedDraw`).
- Neon / Postgres (tabla `lottery_history`).

## API pública
- **Disparador:** handler `scheduled(event, env, ctx)` en `apps/scraper-cron/src/index.ts` (cron **22:00 UTC**, configurado en `wrangler.toml`).
- **Orquestación:** `runScrape(env)` → `fetchViaDecodo` (fetch saliendo por el gateway de Decodo hacia `LOTERIA_SOURCE_URL`) → `parseDraws` → `persist` (upsert).
- **Salida por proxy:** `fetchViaDecodo(env)` hace `fetch` al gateway `https://DECODO_PROXY_HOST:DECODO_PROXY_PORT/` con cabecera `Proxy-Authorization: Basic <btoa(usuario:contraseña)>` y `X-Target-Url: LOTERIA_SOURCE_URL`. En el runtime de Workers no se puede pasar `agent`/`proxy` a `fetch`, por eso se usa el gateway HTTP de Decodo.
- **Parser:** `parseDraws(raw)` en `apps/scraper-cron/src/parser.ts` → `ParsedDraw[]`. Soporta **JSON** (claves en inglés y español: `game/juego`, `drawNumber/numeroSorteo`, `winningNumbers/numeros`, `drawTimestamp/fecha`) y **fallback HTML** por regex sobre atributos `data-*`. `normalizeGame` mapea alias de juego al enum `GameType`.
- **Persistencia:** insert con `onConflictDoNothing({ target: drawNumber })` — upsert idempotente.

## Entidades principales
- [[01_Dominio/Entidades#LotteryDraw|LotteryDraw / lottery_history]] — `drawNumber` único garantiza idempotencia.

## Decisiones técnicas relevantes
- [[02_Arquitectura/adr/0002-arquitectura-edge-cloudflare|ADR-0002]]: cron worker en el edge.
- [[02_Arquitectura/adr/0004-proxy-scraping-via-decodo|ADR-0004]]: proxy de scraping vía Decodo (gateway gestionado), que supersede la decisión de Scrapoxy de ADR-0002.

## Flujos relacionados
- [[05_Procesos/Flujo_Ingestion_Scraping|Ingestión periódica vía scraping]].

## Protección
- Estado en `.aicodeprotect.yml`: **no protegido** (salvo migraciones bajo `apps/**/migrations/**`, que sí lo están).

## Pendiente / no documentado
- El **markup HTML real** del sitio aún debe confirmarse: el fallback espera atributos `data-*` y se ajustará cuando se conozca la fuente.
- Confirmar el **contrato exacto del gateway de Decodo** (nombre real de la cabecera de destino y formato de URL) cuando se disponga de la cuenta: hoy se asume `Proxy-Authorization` + `X-Target-Url`.
- No hay reintentos/backoff ante fallos de la fuente (hoy se registra el error y se omite el ciclo).

## Historial de cambios
- 2026-06-23: **proxy migrado de Scrapoxy a Decodo** (gateway gestionado, no dockerizado). Nueva función `fetchViaDecodo` — el `fetch` ahora SÍ sale por el proxy (resuelto el pendiente "el proxy se aplica a nivel de red/infra, no en el `fetch`"). Variables `SCRAPOXY_*` → `DECODO_PROXY_*`. Ver [[02_Arquitectura/adr/0004-proxy-scraping-via-decodo|ADR-0004]].
- 2026-06-21: implementación real documentada — `parseDraws` (JSON + fallback HTML, `normalizeGame`), `runScrape` con fetch a `LOTERIA_SOURCE_URL`, upsert idempotente (`onConflictDoNothing` sobre `draw_number`) y cron 22:00 UTC. Estado pasa a activo; resuelto el pendiente de andamiaje.
- 2026-06-20: creación inicial (estado andamiaje).
