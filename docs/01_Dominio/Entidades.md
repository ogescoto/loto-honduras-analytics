---
tipo: dominio
estado: activo
actualizado: 2026-06-20
---

# Entidades del modelo de datos

[[00_MAPA_DE_CONTENIDOS|Mapa de Contenidos]]

Modelo de dominio. La fuente canónica es el esquema Drizzle `apps/backend-hono/src/db/schema.ts` (módulo 🔒 protegido) y los tipos compartidos `packages/shared-types/src/domain.ts`. Términos en el [[01_Dominio/Glosario|Glosario]].

## Enums

- **`payment_method`:** `stripe` | `cash_presencial`.
- **`game_type`:** `diaria` | `pega3` | `premia2` | `super_premio`.

## User
Usuario global del sistema.

| Campo | Tipo | Notas |
|---|---|---|
| `id` | uuid | PK, aleatorio |
| `email` | text | único, obligatorio |
| `name` | text | opcional |
| `role` | text | `customer` (def.) \| `admin` \| `clerk` |
| `createdAt` | timestamp | def. ahora |

- Relaciones: 1 User → N [[#Subscription|Subscription]] (como titular `userId`); un admin/clerk puede figurar como `registeredByAdminId` en suscripciones presenciales.

## Subscription
[[01_Dominio/Glosario#Acceso y cobro|Suscripción híbrida]] de tiempo limitado. Controla el acceso premium.

| Campo | Tipo | Notas |
|---|---|---|
| `id` | uuid | PK |
| `userId` | uuid | FK → User (titular) |
| `isActive` | boolean | def. true |
| `paymentMethod` | enum | `stripe` \| `cash_presencial` |
| `startDate` | timestamp | def. ahora |
| `endDate` | timestamp | **expiración temporal exacta** |
| `registeredByAdminId` | uuid? | FK → User; auditoría del cobro presencial |
| `receiptNumber` | text? | recibo correlativo físico |

- **Vigencia:** acceso premium ⇔ `isActive = true` **y** `endDate > ahora`.
- Los dos últimos campos solo se rellenan en cobros `cash_presencial`.

## LotteryDraw (`lottery_history`)
Histórico crudo de sorteos oficiales; objetivo del [[04_Modulos/Scraper_Ingestion|scraper]].

| Campo | Tipo | Notas |
|---|---|---|
| `id` | uuid | PK |
| `game` | enum | tipo de juego |
| `drawNumber` | integer | único |
| `winningNumbers` | integer[] | array nativo Postgres |
| `drawTimestamp` | timestamp | fecha/hora del sorteo |
| `insertedAt` | timestamp | def. ahora |

> Nota: en `shared-types` la entidad se llama `LotteryDraw`; la tabla, `lottery_history`.

## GamePattern (`game_patterns`)
[[01_Dominio/Glosario#Patrones|Patrón de nivel 1]].

| Campo | Tipo | Notas |
|---|---|---|
| `id` | uuid | PK |
| `patternType` | text | `frio_caliente` \| `numerologia_suenos` \| `par_impar` \| `rachas_inversas` |
| `game` | enum | tipo de juego |
| `targetNumbers` | integer[] | números resultantes |
| `metadata` | jsonb | métricas (p. ej. % de aparición) |
| `calculatedAt` | timestamp | def. ahora |

## MetaPattern (`meta_patterns`)
[[01_Dominio/Glosario#Patrones|Meta-patrón (nivel 2)]] — contenido premium.

| Campo | Tipo | Notas |
|---|---|---|
| `id` | uuid | PK |
| `parentPatternIds` | uuid[] | referencia a los GamePattern cruzados (N:M) |
| `description` | text | descripción legible del cruce |
| `crossData` | jsonb | estructura del patrón de segundo orden |
| `updatedAt` | timestamp | def. ahora |

## Mapa de relaciones (resumen)
- `User 1—N Subscription` (titular) y `User 1—N Subscription` (registrador presencial).
- `LotteryDraw` alimenta el cálculo de `GamePattern` (no hay FK formal: el cálculo es analítico).
- `MetaPattern N—M GamePattern` vía `parentPatternIds`.

## Historial de cambios
- 2026-06-20: creación inicial reflejando `schema.ts` y `shared-types/domain.ts`.
