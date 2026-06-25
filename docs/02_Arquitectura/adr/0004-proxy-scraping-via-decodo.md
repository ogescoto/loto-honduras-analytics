---
tipo: adr
estado: aceptado
actualizado: 2026-06-23
---

# ADR-0004: Proxy de scraping vía Decodo (gateway gestionado)

[[00_MAPA_DE_CONTENIDOS|Mapa de Contenidos]]

- **Estado:** Aceptado
- **Fecha:** 2026-06-23
- **Decisores:** Tech Lead
- **Supersede:** la elección de proxy de [[02_Arquitectura/adr/0002-arquitectura-edge-cloudflare|ADR-0002]] (Scrapoxy en Docker).
- **Relacionado:** [[04_Modulos/Scraper_Ingestion|Módulo Scraper]], [[05_Procesos/Flujo_Ingestion_Scraping|Flujo de ingestión]], [[03_Tecnico/Stack|Stack]]

## Contexto
El [[04_Modulos/Scraper_Ingestion|scraper-cron]] es un **Cloudflare Scheduled Worker** que descarga periódicamente los sorteos de la fuente oficial. Para no ser bloqueado por reputación de IP necesita salir por un **proxy rotativo**. Hay dos restricciones que condicionan la decisión:

1. **Runtime edge sin agente HTTP:** en Cloudflare Workers no se puede pasar `agent`/`proxy` a `fetch`, por lo que un proxy a nivel de socket/agente (como el patrón clásico de Scrapoxy) **no es invocable** desde el código del Worker.
2. **Regla de infraestructura del proyecto:** en desarrollo **solo la base de datos** se dockeriza; el resto corre como en producción. Mantener Scrapoxy como contenedor permanente contradice esa regla y añade operación (un súper-proxy a administrar, almacenamiento de config con credenciales, etc.) frente al objetivo de **costo operativo casi nulo** de [[02_Arquitectura/adr/0002-arquitectura-edge-cloudflare|ADR-0002]].

## Decisión
Usar **Decodo** como **gateway de proxy gestionado** (servicio externo, sin contenedor):
- El scraper sale por el gateway HTTP de Decodo mediante `fetch` estándar (compatible con Workers), en la función `fetchViaDecodo(env)` de `apps/scraper-cron/src/index.ts`.
- **Autenticación** por cabecera `Proxy-Authorization: Basic <btoa(usuario:contraseña)>`; el **destino** se indica con `X-Target-Url`.
- **Credenciales por secreto** del Worker (`wrangler secret put`): `DECODO_PROXY_HOST`, `DECODO_PROXY_PORT`, `DECODO_PROXY_USERNAME`, `DECODO_PROXY_PASSWORD`. Nunca en el código ni en la bóveda.
- **No se dockeriza nada** para el proxy: se elimina el servicio `scrapoxy` de `docker/docker-compose.yml` (queda solo Postgres de dev).

## Alternativas consideradas
- **Scrapoxy en Docker (decisión original de ADR-0002):** súper-proxy potente y autoalojado, pero requiere un **contenedor permanente** que administrar, rompe la regla "solo la DB se dockeriza", y su modelo de proxy a nivel de agente **no es directamente invocable desde `fetch` en Workers** (de hecho el código previo salía directo, sin pasar por el proxy). Descartada.
- **Proxy DIY (lista de IPs propia + rotación manual):** control total y sin coste de servicio, pero implica mantener y rotar IPs, gestionar bloqueos y captchas, y más código y operación. Descartada por esfuerzo desproporcionado para el alcance.
- **Otros proveedores de proxy gestionado:** equivalentes en concepto; se elige Decodo por decisión de producto. La integración queda aislada en `fetchViaDecodo`, por lo que cambiar de proveedor afectaría solo a esa función.

## Consecuencias
- (+) Compatible con el runtime edge: `fetch` estándar, sin agente HTTP.
- (+) Coherente con la regla "solo la DB se dockeriza" y con el costo operativo casi nulo (sin contenedor de proxy que mantener).
- (+) El `fetch` **sí** sale por el proxy (se corrige el comportamiento previo, que iba directo a la fuente).
- (+) Integración aislada en `fetchViaDecodo` → cambiar de proveedor es de bajo impacto.
- (−) Dependencia de un servicio externo de pago (Decodo) y de su disponibilidad/cuota.
- (−) El contrato exacto del gateway (nombre de la cabecera de destino, formato de URL) debe confirmarse con la cuenta real; hoy se asume `Proxy-Authorization` + `X-Target-Url`.
- **Impacto en:** [[04_Modulos/Scraper_Ingestion|módulo scraper]], [[05_Procesos/Flujo_Ingestion_Scraping|flujo de ingestión]], `docker/docker-compose.yml`, `.env.example`, `wrangler.toml` del scraper.
- **Reversibilidad:** alta — la salida por proxy está encapsulada en una sola función.

## Seguimiento
- [x] Implementar `fetchViaDecodo` y enrutar `runScrape` por el gateway.
- [x] Reemplazar variables `SCRAPOXY_*` por `DECODO_PROXY_*` (`.env.example`, `wrangler.toml`).
- [x] Eliminar el servicio Scrapoxy de Docker y la carpeta `docker/scrapoxy/`.
- [ ] Confirmar el contrato real del gateway de Decodo (cabecera de destino / formato de URL) al disponer de la cuenta.
- [ ] Añadir reintentos/backoff ante fallos de la fuente o del gateway.
