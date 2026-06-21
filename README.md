# Loto Honduras Analytics

Sistema analítico de lotería **edge-first**: cruza estadística (números fríos/calientes, rachas, paridad) con el imaginario popular hondureño (guía de los sueños, tendencias de búsqueda) para generar patrones y **meta-patrones** premium. Costo operativo casi nulo sobre el ecosistema Cloudflare.

> Este proyecto se rige por el **AI Software Governance Framework**. Si eres un agente de IA, **empieza por** [`CLAUDE.md`](CLAUDE.md) → `ai-software-governance/AI_START_HERE.md`.

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | Astro (SSR, `@astrojs/cloudflare`) · Tailwind · shadcn/ui |
| Backend | Cloudflare Workers · Hono · TypeScript |
| Datos | Drizzle ORM · PostgreSQL (Docker, dev) · Neon serverless (prod) |
| Ingestión | Cloudflare Scheduled Worker · Scrapoxy (proxy rotativo) |
| Tooling | pnpm · Turborepo · Vitest · Playwright |

## Estructura del monorepo

```
.
├── apps/
│   ├── frontend-astro/     # UI (Cloudflare Pages)
│   ├── backend-hono/       # Edge API (Cloudflare Workers) — schema Drizzle, rutas, seeds
│   └── scraper-cron/       # Worker programado de ingestión
├── packages/
│   └── shared-types/       # Contratos TypeScript compartidos (DTI) [protegido]
├── docker/                 # Postgres local + Scrapoxy
├── docs/                   # Bóveda Obsidian (fuente de verdad) — la mantiene SOLO /obsidian
├── ai-software-governance/ # Framework de gobernanza (reglas)
└── .claude/skills/obsidian # Experto Obsidian (custodio de la documentación)
```

## De cero a funcionando

Requisitos: Node 20 (`.nvmrc`), pnpm 9, Docker.

```bash
# 1. Dependencias
pnpm install

# 2. Variables de entorno (rellena los CHANGE_ME / change-me-in-real-env)
cp .env.example .env

# 3. Levantar servicios locales (Postgres + Scrapoxy)
pnpm run up

# 4. Migrar y sembrar datos de desarrollo
pnpm run migrate
pnpm run seed:dev

# 5. Arrancar en local
pnpm run dev
```

## Comandos canónicos

| Acción | Comando |
|---|---|
| Instalar | `pnpm install` |
| Arrancar (todas las apps) | `pnpm run dev` |
| Servicios locales (BD, proxy) | `pnpm run up` / `pnpm run down` |
| Migrar BD | `pnpm run migrate` |
| Seed desarrollo | `pnpm run seed:dev` |
| Seed test | `pnpm run seed:test` |
| Seed producción | `pnpm run seed:prod` |
| Tests | `pnpm run test` |
| E2E | `pnpm run test:e2e` |
| Lint / tipos | `pnpm run lint` · `pnpm run typecheck` |
| Build | `pnpm run build` |

> **Nunca** ejecutes `seed:dev` o `seed:test` contra producción (Neon). Ver `ai-software-governance/08_DevOps/Environments.md`.

## Documentación

La fuente de verdad vive en [`docs/`](docs/) (bóveda Obsidian). **No la edites a mano**: consúltala/actualízala vía el skill `/obsidian`. Punto de entrada: [`docs/00_MAPA_DE_CONTENIDOS.md`](docs/00_MAPA_DE_CONTENIDOS.md).

## Seguridad

- Ningún secreto en el repo. Configúralos en `.env` (local) o con `wrangler secret put` (Workers).
- Zonas protegidas declaradas en [`.aicodeprotect.yml`](.aicodeprotect.yml): auth/middlewares, cobros, pagos, schema y tipos compartidos. Modificarlas requiere aprobación humana (`APPROVED`).
