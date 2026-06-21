---
tipo: arquitectura
estado: activo
actualizado: 2026-06-20
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
- **Stripe:** pagos en línea (vía pago `stripe`). *Integración prevista (módulo `payments/` protegido); aún no implementada en el andamiaje.*
- **Fuente oficial de la Lotería de Honduras:** sitio del que se extraen los sorteos.
- **Scrapoxy:** súper-proxy rotativo que intermedia las peticiones del scraper hacia la fuente para evitar bloqueos.

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
  System_Ext(proxy, "Scrapoxy", "Proxy rotativo")

  Rel(cust, fe, "Usa", "HTTPS")
  Rel(admin, fe, "Administra", "HTTPS")
  Rel(fe, be, "Llama API", "HTTPS/JSON")
  Rel(be, neon, "Lee/escribe", "SQL")
  Rel(be, stripe, "Cobra (previsto)", "HTTPS")
  Rel(cron, proxy, "Solicita vía proxy", "HTTP")
  Rel(proxy, loto, "Scrapea", "HTTPS")
  Rel(cron, neon, "Persiste sorteos", "SQL")
```

## Historial de cambios
- 2026-06-20: creación inicial.
