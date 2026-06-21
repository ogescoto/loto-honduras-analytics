# CLAUDE.md — Instrucciones para agentes de IA

Este proyecto se rige por el **AI Software Governance Framework**.

## ⚠️ Antes de hacer NADA
Lee primero, siempre, el punto de entrada del framework:
👉 `ai-software-governance/AI_START_HERE.md`

Allí está la ruta de lectura según tu tarea (creación / modificación / documentación),
los niveles de obligatoriedad y las reglas de oro.

## Sobre este proyecto
- **Nombre:** Loto Honduras Analytics
- **Propósito:** Sistema analítico de lotería (patrones estadísticos + imaginario popular) con suscripciones híbridas (Stripe online y cobro físico presencial). Edge-first, costo operativo casi nulo.
- **Stack:**
  - **Frontend:** Astro (SSR, adaptador `@astrojs/cloudflare`) + Tailwind CSS + shadcn/ui
  - **Backend:** Cloudflare Workers + Hono (TypeScript)
  - **Datos:** Drizzle ORM · PostgreSQL en Docker (dev) · Neon DB serverless (prod, vía `@neondatabase/serverless`)
  - **Ingestión:** Worker cron + Scrapoxy (proxy rotativo en Docker)
  - **Testing:** Vitest / Jest
  - **Monorepo:** pnpm + Turborepo (`apps/frontend-astro`, `apps/backend-hono`, `apps/scraper-cron`, `packages/shared-types`)
- **Estado:** en desarrollo (fase de arquitectura/especificación)

## Dónde está cada cosa
- **Reglas (framework):** `ai-software-governance/`
- **Especificación original:** `Idea-orignal.md` (raíz) — arquitectura, esquema Drizzle y lógica de negocio de referencia.
- **Documentación / fuente de verdad (bóveda):** `docs/` — **NO la leas/escribas tú directamente**. Pregunta al Experto Obsidian: `/obsidian <consulta>` (antes) y `/obsidian update <archivos> -- <resumen>` (después). Punto de entrada: `docs/00_MAPA_DE_CONTENIDOS.md`.
- **Módulos protegidos:** `.aicodeprotect.yml` (raíz).
- **Variables de entorno:** `.env.example` (raíz).
- **Comandos del proyecto:** `package.json` / `turbo.json` — `pnpm run dev`, `test`, `test:e2e`, `migrate`, `seed:dev`, `seed:test`, `seed:prod`, `up`/`down`.

## Reglas no negociables (resumen — el detalle está en el framework)
1. **No escribas código sin una tarea explícita.**
2. **No modifiques módulos protegidos** (`.aicodeprotect.yml`) sin aprobación humana.
3. **Toda entidad/caso de uso nuevo lleva seeds `dev_` y `test_`.**
4. **No dejes el repo con tests en rojo.**
5. **Ningún secreto en el código** (atención: `Idea-orignal.md` contiene credenciales de ejemplo de Docker/Scrapoxy — son placeholders, no reutilizar en real).
6. **No escribas en `docs/`.** Consulta al Experto Obsidian (`/obsidian`) antes y entrégale los cambios después; él es el único que mantiene la fuente de verdad.

## Flujo de trabajo
Sigue `ai-software-governance/09_AI/Agent_Workflow.md`
y cierra con la checklist correspondiente de `ai-software-governance/Checklists/`.

## Notas específicas de este proyecto
- El framework está clonado en `ai-software-governance/` (copia/vendoring), **no** en `.governance/`. Todas las rutas de este archivo ya reflejan esa ubicación real.
- Adopción del framework **completa**: existen `.aicodeprotect.yml`, `.env.example`, `.gitignore`, `.nvmrc`, `.github/` (CI, CODEOWNERS, dependabot, plantillas), la bóveda `docs/` poblada y el skill `/obsidian` instalado. El monorepo (apps + packages) está andamiado.
- Las decisiones de arquitectura ya están como ADR: `docs/02_Arquitectura/adr/0001-...` (adopción del framework) y `0002-...` (arquitectura edge Cloudflare).
- **Andamiaje, no implementación final.** Falta implementar como tareas explícitas: auth JWT real (hoy el `userId` se lee del query), módulo `payments/` (Stripe; solo existe `cash_presencial`), el parser/ingestión real del scraper, el motor de cálculo de patrones, y la UI completa (Dashboard, Zona Premium, Admin). Ver los "Pendiente" anotados en las notas de `docs/04_Modulos/`.
- **Pasos manuales que requieren tu acción** (no automatizables por un agente): `git init` + primer commit + crear el repo remoto, aplicar la protección de `main` (`ai-software-governance/Templates/github/branch-protection.md`), y `pnpm install` para generar el lockfile.
