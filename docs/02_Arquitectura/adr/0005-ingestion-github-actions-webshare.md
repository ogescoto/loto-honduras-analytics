---
tipo: adr
estado: aceptado
actualizado: 2026-06-25
---

# ADR-0005: Ingestión en GitHub Actions (WebShare) + endpoint de ingestión

[[00_MAPA_DE_CONTENIDOS|Mapa de Contenidos]]

- **Estado:** Aceptado
- **Fecha:** 2026-06-25
- **Decisores:** Tech Lead
- **Supersede:** la decisión "ingestión = Cloudflare Scheduled Worker" de [[02_Arquitectura/adr/0002-arquitectura-edge-cloudflare|ADR-0002]] (el Worker pasa a **respaldo**) y anula [[02_Arquitectura/adr/0004-proxy-scraping-via-decodo|ADR-0004]] (Decodo).
- **Relacionado:** [[04_Modulos/Scraper_Ingestion|Módulo Ingestión]], [[05_Procesos/Flujo_Ingestion_Scraping|Flujo de ingestión]], [[03_Tecnico/Stack|Stack]], [[01_Dominio/Entidades#LotteryDraw|LotteryDraw]]

## Contexto
Al investigar la fuente se descubrió que **no es scraping de HTML** sino una **API JSON**
(`https://api.loteriasdehonduras.com/honduras`, SPA Nuxt 3); el feed diario es
`GET /feed/game-stats`. Para evitar bloqueos por IP se decide usar **WebShare**, que
entrega una **lista de proxies a nivel de socket** (`ip:puerto:usuario:contraseña`).

Restricción clave: el `fetch` de **Cloudflare Workers no admite `agent`/`proxy`**, así que
una lista de proxies a nivel de socket **no es utilizable desde el Worker**. En **Node**
sí lo es (`undici` `ProxyAgent`).

## Decisión
1. **Ingestión principal en GitHub Actions (Node).** Un job (`scripts/ingest/run.ts`,
   workflow `.github/workflows/ingest.yml`, cron) descarga la lista de WebShare, llama la
   API **vía proxy** (`undici` ProxyAgent, rotación aleatoria) y envía los sorteos a
   nuestro backend.
2. **Endpoint de ingestión protegido**: `POST /api/v1/ingest` (`apps/backend-hono`) hace
   **upsert idempotente** (`onConflictDoNothing` sobre `session_id`). Auth
   **máquina-a-máquina** con `requireServiceToken` (header `X-Ingest-Token` + secreto
   `INGEST_SERVICE_TOKEN`, comparación de tiempo constante) — **no** el JWT de usuario.
3. **Worker `scraper-cron` = respaldo.** Mantiene un cron que llama la API
   **directamente (sin proxy)** y persiste igual; es el fallback si Actions falla.
4. **Secretos**: `WEBSHARE_PROXY_LIST_URL` (URL con token embebido), `API_BASE_URL`,
   `APP_API_BASE_URL`, `INGEST_SERVICE_TOKEN` — en *secrets* de GitHub / del Worker.

## Alternativas consideradas
- **Mantener todo en el Worker (Decodo / gateway):** descartada — la fuente y el proxy
  reales no encajan con `fetch` del edge; ver [[02_Arquitectura/adr/0004-proxy-scraping-via-decodo|ADR-0004]].
- **Actions escribe directo en Neon:** posible, pero acopla el job al esquema y a las
  credenciales de BD. Se prefiere el **endpoint** (validación + un solo punto de escritura).
- **Solo el Worker, sin proxy:** la API hoy no exige auth ni rate-limit visible, pero sin
  proxy hay riesgo de bloqueo por IP a futuro. Se conserva como **respaldo**, no como vía única.

## Consecuencias
- (+) El proxy WebShare funciona de verdad (Node), cumpliendo "salir por proxy".
- (+) Ingestión desacoplada del runtime edge; el backend valida y centraliza la escritura.
- (+) Doble vía (Actions principal + Worker respaldo) aumenta la resiliencia.
- (−) La ingestión deja de ser 100% Cloudflare (entra GitHub Actions en la operación).
- (−) Dependencia de WebShare (servicio externo) y de su cuota.
- **Impacto en:** módulo de ingestión, flujo de ingestión, backend (endpoint+middleware),
  Worker (a respaldo), `scripts/ingest/*`, `.github/workflows/ingest.yml`, variables.
- **Reversibilidad:** media — el endpoint y el parser quedan; cambiar de proveedor de
  proxy afecta solo a `scripts/ingest/webshare.ts`.

## Seguimiento
- [x] Endpoint `POST /api/v1/ingest` + `requireServiceToken` (upsert idempotente).
- [x] Job `scripts/ingest/*` (WebShare + `undici`) y workflow `ingest.yml`.
- [x] Worker reescrito como respaldo (API directa, sin proxy).
- [ ] Configurar los *secrets* en GitHub y validar el workflow con `workflow_dispatch`.
- [ ] Confirmar el formato exacto de la lista de WebShare al disponer de la cuenta.
- [ ] Reintentos/backoff ante fallos de la API o del proxy.
