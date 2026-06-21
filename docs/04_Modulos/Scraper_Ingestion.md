---
tipo: modulo
modulo: scraper-ingestion
estado: andamiaje
actualizado: 2026-06-20
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
- **Disparador:** handler `scheduled(event, env, ctx)` en `apps/scraper-cron/src/index.ts`.
- **Parser:** `parseDraws(rawHtml)` en `apps/scraper-cron/src/parser.ts` → `ParsedDraw[]`.

## Entidades principales
- [[01_Dominio/Entidades#LotteryDraw|LotteryDraw / lottery_history]] — `drawNumber` único garantiza idempotencia.

## Decisiones técnicas relevantes
- [[02_Arquitectura/adr/0002-arquitectura-edge-cloudflare|ADR-0002]]: cron worker en el edge; Scrapoxy para la ingestión.

## Flujos relacionados
- [[05_Procesos/Flujo_Ingestion_Scraping|Ingestión periódica vía scraping]].

## Protección
- Estado en `.aicodeprotect.yml`: **no protegido** (salvo migraciones bajo `apps/**/migrations/**`, que sí lo están).

## Pendiente / no documentado
- **Andamiaje:** `parseDraws` devuelve `[]` (TODO) y el `scheduled` no hace fetch real ni *upsert*; falta implementar la extracción contra la fuente, el upsert idempotente en `lottery_history` y la frecuencia exacta del cron.

## Historial de cambios
- 2026-06-20: creación inicial (estado andamiaje).
