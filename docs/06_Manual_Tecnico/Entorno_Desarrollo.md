# Guía de Entorno de Desarrollo

## Requisitos

- Node.js ≥ 20 (`node -v`)
- pnpm ≥ 9 (`pnpm -v`)
- Docker Desktop corriendo

## Primer arranque

```powershell
# Instalar dependencias
pnpm install

# Levantar PostgreSQL en Docker
pnpm up

# Aplicar migraciones
pnpm migrate

# Cargar 6,615 sorteos históricos + calcular patrones para 13 juegos
pnpm seed:dev

# Iniciar todo
pnpm dev
```

Abre `http://localhost:4321` — verás el dashboard con patrones reales.

## Variables de entorno

### Backend — `apps/backend-hono/.dev.vars`
Copia el ejemplo y completa los valores:
```env
NEON_DATABASE_URL=postgres://dev_user:dev_local_pw@127.0.0.1:5432/loto_analytics_dev
JWT_SECRET=cualquier-string-largo-para-desarrollo
STRIPE_API_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
APP_BASE_URL=http://localhost:4321
INGEST_SERVICE_TOKEN=token-interno-local
BREVO_API_KEY=tu-api-key-de-brevo
GOOGLE_CLIENT_ID=tu-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=tu-client-secret
```

### Frontend — `apps/frontend-astro/.dev.vars`
```env
API_BASE_URL=http://localhost:8787
```

### Frontend — `.env` (raíz o en `apps/frontend-astro/`)
```env
PUBLIC_API_BASE_URL=http://localhost:8787
PUBLIC_ADSENSE_ID=              # dejar vacío en desarrollo
PUBLIC_ADSENSE_SLOT_1=
PUBLIC_ADSENSE_SLOT_2=
```

## Pipeline de migraciones en producción (Neon)

`drizzle-kit migrate` registra lo aplicado en la tabla **`drizzle.__drizzle_migrations`** (schema `drizzle`): columnas `id`, `hash` (SHA-256 del archivo `.sql`) y `created_at` (= el `when` del `_journal.json`, en ms). Drizzle **solo aplica migraciones cuyo `when` sea mayor que el `created_at` de la última fila**, sin validar el hash al saltar.

- **Estado alineado (2026-09-05):** `drizzle.__drizzle_migrations` contiene las 7 migraciones (`0000`…`0006`, incluida `0006_overrated_peter_parker`). `pnpm migrate` contra Neon ahora es **idempotente y no ejecuta nada nuevo**.
- ⚠️ No marcar manualmente una migración como aplicada hasta verificar que su DDL ya está en la BD: `drizzle-kit migrate` saltará las marcadas. Para re-marcar el baseline se insertó la fila con `created_at = when` de la última migración real.
- En local (Docker) el flujo sigue siendo `pnpm up && pnpm migrate` (la tabla se crea desde cero y aplica 0000 → última).

## Comandos útiles

| Comando | Descripción |
|---|---|
| `pnpm dev` | Inicia backend (:8787) y frontend (:4321) en paralelo |
| `pnpm test` | Ejecuta todos los tests (Vitest) |
| `pnpm typecheck` | TypeScript sin emit en todos los paquetes |
| `pnpm seed:dev` | Recarga datos y recalcula patrones (idempotente) |
| `pnpm migrate` | Aplica migraciones pendientes |
| `pnpm up` / `pnpm down` | Inicia/detiene el contenedor de PostgreSQL |
| `pnpm build` | Build de producción (dry-run de wrangler) |

## Estructura de puertos

| Servicio | Puerto | Descripción |
|---|---|---|
| PostgreSQL (Docker) | 5432 | Base de datos de desarrollo |
| Backend (Wrangler) | 8787 | Edge API — Hono + Drizzle |
| Frontend (Astro) | 4321 | SSR con adaptador Cloudflare |

## Flujo de datos

```
PostgreSQL :5432
    ↑ seed:dev / pnpm migrate
    │
Backend :8787  ←──── Wrangler simula el Worker de Cloudflare
    ↑ fetch SSR (apiGetSSR)
    │
Frontend :4321 ←──── Astro con platformProxy (simula Cloudflare Pages)
    ↑
Navegador
```

El frontend hace fetch al backend durante SSR (server-side rendering), no desde el navegador. Por eso es importante que ambos servicios estén activos al mismo tiempo.

## Credenciales de usuarios de desarrollo (seed:dev)

| Email | Rol | Contraseña |
|---|---|---|
| `admin@loto.dev` | admin | *(sin contraseña — usar Google OAuth o agregar vía endpoint)* |
| `clerk@loto.dev` | clerk | *(sin contraseña)* |

Para crear un usuario de prueba con contraseña:
```powershell
Invoke-RestMethod http://localhost:8787/api/v1/auth/register -Method POST `
  -ContentType "application/json" `
  -Body '{"email":"yo@test.com","password":"Test1234!","name":"Mi Usuario"}'
```
