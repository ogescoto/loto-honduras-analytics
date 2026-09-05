---
tipo: modulo
modulo: admin-logs
estado: activo
actualizado: 2026-09-05
---

# Módulo: Admin · Logs de ingestión

[[00_MAPA_DE_CONTENIDOS|Mapa de Contenidos]]

## Responsabilidad
Mostrar al **admin** (o clerk) el historial cronológico de actividad de la **ingestión**: cada chequeo de fuente (éxito/error), los fallos al persistir y el resumen de cada ejecución del cron. Diagnóstico: responder *"¿por qué no llegó tal sorteo?"*.

## Lenguaje ubicuo
- **Evento de ingestión (IngestionEvent), nivel (info/warn/error), franja:** ver [[01_Dominio/Glosario|Glosario]] y [[01_Dominio/Entidades#IngestionEvent|Entidades]].

## Dependencias
- [[04_Modulos/Scraper_Ingestion|Scraper · Ingestión]] (emisor de los eventos).
- [[01_Dominio/Entidades#DrawSource|DrawSource / draw_sources]] (FK opcional `sourceId`).

## Cómo fluye (write path)
1. El **scraper** (`apps/scraper-cron/src/index.ts`) emite eventos best-effort vía `emitLogEvent()`:
   - En `reportHealth()`: `info "Fuente … OK"` o `error "Fuente …: <mensaje>"` por cada chequeo.
   - En `ingestDraws()`: `warn` si `POST /api/v1/ingest` falla y cae a inserción directa en Neon.
   - Al cerrar cada franja: `info` de resumen (`Franja HH:00 HN completada — N sorteos insertados`) o `warn` si se agotaron intentos.
2. `POST /api/v1/ingest/events` valida y hace `INSERT` en `ingestion_events` (nivel por defecto `info`, mensaje truncado a 500, `meta` jsonb opcional). Protegido con `requireServiceToken`.

## API pública
- **Write (máquina-a-máquina):** `POST /api/v1/ingest/events` — body `{ level?, sourceId?, game?, message, meta? }`. `sourceId` debe existir (FK); `404 NOT_FOUND` si no. `400 VALIDATION_ERROR` sin `message`.
- **Read (admin):** `GET /api/v1/admin/logs?level=&game=&limit=&offset=` — eventos desc por `createdAt`; `leftJoin` con `draw_sources` para el nombre de la fuente. Filtros `level` (info|warn|error) y `game`; `limit` máx. 500 (def. 100). Acceso `requireAuth` + `requireRole("admin","clerk")`.
- Código: `apps/backend-hono/src/routes/ingest-events.ts`, `apps/backend-hono/src/routes/admin/logs.ts`. Montadas en `apps/backend-hono/src/index.ts`.

## UI
- `/admin/logs` (`apps/frontend-astro/src/pages/admin/logs.astro`): sección **"Tareas programadas (cron)"** que describe los 3 disparos del Worker (franja HN, cron UTC, juegos y última corrida por franja), seguida de la tabla con Fecha (HN), Nivel (badge de color), Fuente, Juego, Mensaje y Detalle (meta en `<details>`). Formulario de filtros por nivel y juego. Enlace añadido en el nav de `admin.astro`, `admin/resultados.astro` y `admin/fuentes.astro`.

## Entidades principales
- [[01_Dominio/Entidades#IngestionEvent|IngestionEvent / ingestion_events]].

## Flujos relacionados
- [[05_Procesos/Flujo_Ingestion_Scraping|Ingestión periódica de sorteos]].

## Protección
- Estado en `.aicodeprotect.yml`: **🔒 protegido** — `apps/backend-hono/src/routes/admin/**`, `src/db/schema.ts` y `apps/**/migrations/**`. Aprobado con `APPROVED` el 2026-09-05.

## Pendiente / no documentado
- La vía de GitHub Actions (`.github/workflows/ingest.yml`, `scripts/ingest/`) **no** emite eventos todavía (solo el Worker de respaldo lo hace).
- No hay retención/purga automática: la tabla crece sin límite (≈6 eventos/día a día de hoy).

## Historial de cambios
- 2026-09-05: añadida la sección **Tareas programadas** en `/admin/logs` (crons 11:15/15:15/21:15 HN + última corrida por franja).
- 2026-09-05: creación. Tabla `ingestion_events` (migración `0005_ingestion_events`), endpoints de write (service token) y read (admin), emisión de eventos desde el scraper y página `/admin/logs`.