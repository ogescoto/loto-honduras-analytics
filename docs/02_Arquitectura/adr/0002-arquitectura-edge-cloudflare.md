---
tipo: adr
estado: aceptado
actualizado: 2026-06-20
---

# ADR-0002: Arquitectura edge en Cloudflare

[[00_MAPA_DE_CONTENIDOS|Mapa de Contenidos]]

- **Estado:** Aceptado
- **Fecha:** 2026-06-20
- **Decisores:** Tech Lead
- **Relacionado:** [[02_Arquitectura/C4_Contexto|C4 Contexto]], [[03_Tecnico/Stack|Stack]]

## Contexto
El producto se dirige a usuarios móviles en Honduras, con redes de conectividad variable, y debe operar con **costo operativo cercano a cero** y escalado automático. La carga es de lectura intensiva (consultar patrones) con escrituras puntuales (cobros, ingestión programada de sorteos). No hay un equipo de operaciones para administrar servidores.

## Decisión
Usaremos una **arquitectura edge sobre Cloudflare**:
- **Frontend:** Astro SSR desplegado en Cloudflare Pages (HTML ligero, móvil-first).
- **API:** Hono sobre Cloudflare Workers (V8 isolates, Web Crypto, arranque casi instantáneo).
- **Ingestión:** un Cloudflare Scheduled Worker (`scraper-cron`) disparado por cron.
- **Datos:** Drizzle ORM sobre Postgres — Docker local en desarrollo y **Neon serverless** en producción (vía `@neondatabase/serverless`), compatible con el runtime edge.

## Alternativas consideradas
- **Backend tradicional (Node.js/Express en VM o contenedor):** ecosistema maduro y librerías Node completas, pero implica gestión de servidores, costo base fijo, *cold starts* en escalado y latencia desde la región de despliegue. Descartada por costo y operación.
- **Postgres autogestionado (RDS / contenedor permanente):** control total, pero costo fijo y operación continua, y conexiones persistentes poco afines al modelo edge. Descartada a favor de Neon serverless.
- **Functions de otro proveedor (AWS Lambda / Vercel):** válidas, pero Workers ofrece menor latencia perimetral global, modelo de costo más favorable para esta carga y mejor integración con Pages/cron en un mismo ecosistema.

## Consecuencias
- (+) Costo operativo casi nulo y escalado automático global.
- (+) Latencia baja en el borde, ideal para móvil.
- (+) Un solo ecosistema (Pages + Workers + cron) reduce la complejidad de despliegue.
- (−) Restricciones del runtime edge: sin APIs Node completas; las librerías deben ser compatibles con Workers.
- (−) Acceso a BD vía driver serverless (HTTP/WebSocket), no conexiones TCP persistentes tradicionales.
- (−) El scraping requiere infraestructura adicional (Scrapoxy) para evitar bloqueos por reputación de IP.
- **Impacto en:** todos los módulos backend, el scraper y la capa de datos.
- **Reversibilidad:** media — migrar a un backend tradicional exigiría reescribir adaptadores de runtime y la capa de conexión a BD.

## Seguimiento
- [x] Andamiar `backend-hono`, `scraper-cron` y `client.ts` con driver Neon.
- [ ] Implementar verificación JWT en el edge (hoy `userId` por query es andamiaje).
- [ ] Configurar Scrapoxy y el trigger cron reales.
