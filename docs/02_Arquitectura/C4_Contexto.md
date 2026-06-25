---
tipo: arquitectura
estado: activo
actualizado: 2026-06-23
---

# C4 · Diagrama de Contexto

[[00_MAPA_DE_CONTENIDOS|Mapa de Contenidos]]

Nivel 1 del modelo C4: el sistema **Loto Honduras Analytics** y sus actores y sistemas externos. Decisión arquitectónica en [[02_Arquitectura/adr/0002-arquitectura-edge-cloudflare|ADR-0002]].

## Actores
- **Cliente (`customer`):** consulta patrones de nivel 1 y, si está suscrito, meta-patrones premium. Móvil-first.
- **Administrador (`admin`):** gestiona el sistema y registra cobros presenciales.
- **Clerk (ventanilla):** cobra efectivo y registra el cobro presencial.

## Sistema
- **Loto Honduras Analytics** — plataforma analítica *edge-first*:
  - `frontend-astro` (Astro SSR en Cloudflare Pages).
  - `backend-hono` (API en Cloudflare Workers).
  - `scraper-cron` (Cloudflare Scheduled Worker).

## Sistemas externos
- **Cloudflare (edge):** ejecuta frontend, API y cron en nodos perimetrales globales.
- **Neon DB:** Postgres serverless de producción (vía `@neondatabase/serverless`).
- **Stripe:** pagos en línea (vía pago `stripe`). Integración **implementada** vía API REST + webhook firmado en el módulo 🔒 [[04_Modulos/Pagos|Pagos]] (ver [[02_Arquitectura/adr/0003-pagos-stripe-via-rest-en-edge|ADR-0003]]).
- **Fuente oficial de la Lotería de Honduras:** sitio del que se extraen los sorteos.
- **Decodo:** gateway de proxy rotativo (servicio externo gestionado) que intermedia las peticiones del scraper hacia la fuente para evitar bloqueos. Ver [[02_Arquitectura/adr/0004-proxy-scraping-via-decodo|ADR-0004]].

## Diagrama (Mermaid)
```mermaid
C4Context
  title Contexto — Loto Honduras Analytics
  Person(cust, "Cliente", "Consulta patrones y meta-patrones")
  Person(admin, "Admin / Clerk", "Registra cobros presenciales")
  System_Boundary(sys, "Loto Honduras Analytics (edge)") {
    System(fe, "frontend-astro", "Astro SSR / Cloudflare Pages")
    System(be, "backend-hono", "API Hono / Cloudflare Workers")
    System(cron, "scraper-cron", "Scheduled Worker")
  }
  System_Ext(neon, "Neon DB", "Postgres serverless")
  System_Ext(stripe, "Stripe", "Pagos en línea")
  System_Ext(loto, "Fuente Lotería HN", "Sitio oficial de sorteos")
  System_Ext(proxy, "Decodo", "Gateway de proxy rotativo")

  Rel(cust, fe, "Usa", "HTTPS")
  Rel(admin, fe, "Administra", "HTTPS")
  Rel(fe, be, "Llama API", "HTTPS/JSON")
  Rel(be, neon, "Lee/escribe", "SQL")
  Rel(be, stripe, "Cobra (REST + webhook)", "HTTPS")
  Rel(cron, proxy, "Solicita vía gateway", "HTTPS")
  Rel(proxy, loto, "Scrapea con IP rotativa", "HTTPS")
  Rel(cron, neon, "Persiste sorteos", "SQL")
```

## Historial de cambios
- 2026-06-23: el proxy del scraper pasa de Scrapoxy a **Decodo** (gateway gestionado); actualizados sistemas externos y diagrama. Ver [[02_Arquitectura/adr/0004-proxy-scraping-via-decodo|ADR-0004]].
- 2026-06-21: Stripe pasa de "previsto" a integración implementada (módulo Pagos, ADR-0003).
- 2026-06-20: creación inicial.
