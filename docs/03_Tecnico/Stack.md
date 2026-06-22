---
tipo: tecnico
estado: activo
actualizado: 2026-06-21
---

# Stack tecnológico y comandos canónicos

[[00_MAPA_DE_CONTENIDOS|Mapa de Contenidos]]

Stack del monorepo y comandos de uso diario. Decisión en [[02_Arquitectura/adr/0002-arquitectura-edge-cloudflare|ADR-0002]]. Versiones aproximadas según `package.json` (junio 2026).

## Monorepo
- **Gestor:** pnpm `9.12` · **Orquestador:** Turborepo `2.1` · **Node:** `24` (fijado).
- Workspaces: `apps/*` + `packages/*`. Formato con Prettier `3.3`.
- **Lint:** ESLint (flat config en la raíz `eslint.config.mjs`).

## Frontend — `apps/frontend-astro`
- **Astro** (SSR, adaptador `@astrojs/cloudflare`) · **Tailwind CSS** · **shadcn/ui**.
- Tests E2E: **Playwright**.

## Backend — `apps/backend-hono`
- **Hono** `4.6` sobre **Cloudflare Workers** (`wrangler` `3.80`, types `@cloudflare/workers-types`).
- **Auth:** `hono/jwt` (JWT HS256 vía Web Crypto, compatible con Workers). Ver [[04_Modulos/Suscripciones|Suscripciones]].
- **Pagos:** Stripe vía **API REST + `fetch`** y verificación de webhook con **Web Crypto** (sin SDK de Node). Ver [[02_Arquitectura/adr/0003-pagos-stripe-via-rest-en-edge|ADR-0003]] y [[04_Modulos/Pagos|Pagos]].
- **Drizzle ORM** `0.36` + **drizzle-kit** `0.28` (migraciones).
- Driver BD: **@neondatabase/serverless** `0.10`.
- Tests: **Vitest** `2.1` (backend 13 tests, scraper 5 tests). Seeds con `tsx` y `@faker-js/faker` (dev/test).

## Scraper — `apps/scraper-cron`
- Cloudflare **Scheduled Worker** (`wrangler`). Proxy rotativo **Scrapoxy** (Docker).

## Tipos compartidos — `packages/shared-types`
- TypeScript puro (DTI): `domain.ts` (entidades) + `api.ts` (contratos). 🔒 protegido.

## Datos
- **Dev:** PostgreSQL 15 en Docker (`docker/docker-compose.yml`) + Scrapoxy.
- **Prod:** Neon serverless. Conexión por `NEON_DATABASE_URL` (prod) / `DATABASE_URL` (local).

## Comandos canónicos (raíz del monorepo)
| Comando | Qué hace |
|---|---|
| `pnpm dev` | Levanta todas las apps en modo desarrollo (Turborepo). |
| `pnpm build` | Compila/empaqueta todas las apps. |
| `pnpm lint` / `pnpm typecheck` | Lint y chequeo de tipos. |
| `pnpm test` | Tests unitarios (Vitest). |
| `pnpm test:e2e` | Tests E2E (Playwright). |
| `pnpm up` / `pnpm down` | Arranca/detiene el entorno Docker (Postgres + Scrapoxy). |
| `pnpm migrate` | Aplica migraciones Drizzle. |
| `pnpm seed:dev` / `seed:test` / `seed:prod` | Carga el seed correspondiente. |
| `pnpm format` | Formatea con Prettier. |

> En `backend-hono`: `pnpm migrate:generate` genera migraciones; `seed:prod` solo carga catálogos (prohibidos datos ficticios). El runner bloquea seeds dev/test contra la BD de producción.

## Variables de entorno clave
- `NEON_DATABASE_URL` (prod), `DATABASE_URL` (local/test), `JWT_SECRET` (backend).
- Pagos: `STRIPE_API_KEY`, `STRIPE_WEBHOOK_SECRET`, `APP_BASE_URL`.
- Scraper: `SCRAPOXY_URL`, `LOTERIA_SOURCE_URL`.

## Repositorio e infraestructura
- Repo git con remoto en `https://github.com/ogescoto/loto-honduras-analytics` (público).
- Rama `main` protegida: CI requerido (`quality` + `e2e`), review de **CODEOWNERS**, historia lineal.
- El framework de gobernanza se incorporó por **vendoring** (se eliminó su `.git`).

## Historial de cambios
- 2026-06-21: añadidos `hono/jwt` (auth), Stripe vía REST/fetch + Web Crypto (ADR-0003), ESLint flat config, Node fijado a 24, variables de Stripe, y sección de repositorio/CI (main protegida).
- 2026-06-20: creación inicial reflejando `package.json` raíz y de backend.
