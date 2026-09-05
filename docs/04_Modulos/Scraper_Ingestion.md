---
tipo: modulo
modulo: ingestion
estado: activo
actualizado: 2026-09-05
---

# Módulo: Ingestión de sorteos

[[00_MAPA_DE_CONTENIDOS|Mapa de Contenidos]]

## Responsabilidad
Mantener actualizado el histórico de sorteos consumiendo la **API JSON** oficial y persistiéndolos de forma idempotente. Tiene **dos vías**: principal en **GitHub Actions** (sale por proxy) y **respaldo** en un Cloudflare Scheduled Worker (sin proxy). Decisión en [[02_Arquitectura/adr/0005-ingestion-github-actions-webshare|ADR-0005]].

## Lenguaje ubicuo
- **Sorteo (LotteryDraw), tipo de juego, comodín, signo:** ver [[01_Dominio/Glosario|Glosario]].

## Fuente real
- **API:** `https://api.loteriasdehonduras.com/honduras` (SPA Nuxt 3 detrás del sitio). Feed diario: `GET /feed/game-stats`.
- **Identidad del juego:** el discriminador **fiable** es el `siteGameId` (mapa `SITE_GAME_IDS` en el parser). El `horario` del JSON crudo **no es de fiar**.
- **Números:** texto (`"00"`), con comodines (`"JG"`, `"2X"`) y signos del imaginario popular (`"00 Avión"`).

## Vía principal — GitHub Actions (Node)
- `scripts/ingest/run.ts` (workflow `.github/workflows/ingest.yml`, cron): descarga la lista de **WebShare**, llama la API **vía proxy** (`undici` `ProxyAgent`, rotación) y hace `POST` al endpoint de ingestión del backend.
- `scripts/ingest/webshare.ts`: `fetchProxyList`, `pickProxy`, `fetchViaProxy`.
- `scripts/ingest/parse-feed.ts`: `parseFeed` (espejo del parser; aplana `score`, resuelve juego por `siteGameId`).
- **Por qué Node y no el Worker:** `fetch` de Cloudflare Workers no admite proxy a nivel de socket (lo que da WebShare). Node sí.

## Endpoint de ingestión (backend)
- `POST /api/v1/ingest` (`apps/backend-hono/src/routes/ingest.ts`): valida y hace **upsert idempotente** `onConflictDoNothing({ target: sessionId })` en `lottery_history`.
- **Auth máquina-a-máquina:** `requireServiceToken` (`apps/backend-hono/src/middlewares/require-service-token.ts`) — header `X-Ingest-Token` vs secreto `INGEST_SERVICE_TOKEN`, comparación de tiempo constante. **No** es el JWT de usuario. 🔒 (middleware protegido).

## Vía respaldo — Worker `scraper-cron`
- `apps/scraper-cron/src/index.ts`: `scheduled()` → `computeSlot()` (franja activa por hora HN: 11/15/21) → `runSlot()` con **reintentos cada 5 min** (hasta 12 intentos ≈ 60 min) y **auto-recuperación**: re-ingiere lo que falte de los **últimos 6 días** (`CATCH_UP_DAYS`, `eligibleMarkers()`), idempotente por `sessionId`. Persistencia vía `POST /api/v1/ingest`; **fallback a inserción directa en Neon** si el backend no responde. Crons `15 3,17,21 * * *` (UTC).
- `apps/scraper-cron/src/parser.ts`: parser compartido (`SITE_GAME_IDS`, `gameFromSiteId`, `gameFromTitle`, `parseRawRecords`, `parseFeed`, `parseSiteGameSessions`).
- `apps/scraper-cron/src/schedules.ts`: `LOTO_HN_SCHEDULES` (franjas/días), `HN_UTC_OFFSET`.

## Eventos de log (panel admin)
El Worker emite eventos best-effort a `POST /api/v1/ingest/events` (`emitLogEvent()`): éxito/error de cada chequeo de fuente, aviso si `POST /api/v1/ingest` falla y cae a Neon directo, y resumen al cerrar cada franja (insertados o agotamiento de intentos). Ver [[04_Modulos/Admin_Logs|Admin · Logs]]. *La vía GitHub Actions aún no emite eventos.*

## Carga histórica (seed dev)
- `apps/backend-hono/src/db/seeds/import-raw.ts`: lee `Data/raw/*.json` (mapeo por `siteGameId`) y carga ~6.615 sorteos reales en `seed:dev`, deduplicando por `sessionId`.

## Entidades principales
- [[01_Dominio/Entidades#LotteryDraw|LotteryDraw / lottery_history]] — `sessionId` único garantiza idempotencia.

## Decisiones técnicas relevantes
- [[02_Arquitectura/adr/0005-ingestion-github-actions-webshare|ADR-0005]]: ingestión en GitHub Actions + WebShare + endpoint (supersede la ingestión-en-Worker de [[02_Arquitectura/adr/0002-arquitectura-edge-cloudflare|ADR-0002]] y anula la vía Decodo de [[02_Arquitectura/adr/0004-proxy-scraping-via-decodo|ADR-0004]]).

## Flujos relacionados
- [[05_Procesos/Flujo_Ingestion_Scraping|Ingestión periódica de sorteos]].

## Protección
- `apps/backend-hono/src/middlewares/**` y `src/db/schema.ts` → 🔒 protegidos. Migraciones bajo `apps/**/migrations/**` y `.github/workflows/**` → 🔒.

## Pendiente / no documentado
- Configurar los *secrets* en GitHub y validar el workflow con `workflow_dispatch`.
- Confirmar el **formato exacto de la lista de WebShare** al disponer de la cuenta.
- Reintentos/backoff ante fallos de la API o del proxy.

## Historial de cambios
- 2026-09-05: Worker reescrito con **franjas por hora HN + reintentos + auto-recuperación de 6 días** (define el objetivo; resuelve el sorteo 9PM tarde). El Worker emite **eventos de log** a `POST /api/v1/ingest/events` ([[04_Modulos/Admin_Logs|Admin · Logs]]). Primer verificado en backfill manual; fallback vía `POST /api/v1/ingest` con *–data directa Neon*.
- 2026-06-25: **rediseño completo.** Fuente = API JSON real (`/feed/game-stats`); identidad por `siteGameId`. Ingestión principal en **GitHub Actions** (proxy **WebShare** vía `undici`) → endpoint `POST /api/v1/ingest` (auth de servicio); Worker = **respaldo** (API directa). Carga histórica real en seed dev. Decodo anulado. Ver [[02_Arquitectura/adr/0005-ingestion-github-actions-webshare|ADR-0005]].
- 2026-06-23: (anulado) proxy Scrapoxy→Decodo.
- 2026-06-21: implementación inicial (scraping HTML supuesto, cron Worker).
- 2026-06-20: creación inicial (estado andamiaje).
