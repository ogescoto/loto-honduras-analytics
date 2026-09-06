---
tipo: dominio
estado: activo
actualizado: 2026-09-05
---

# Entidades del modelo de datos

[[00_MAPA_DE_CONTENIDOS|Mapa de Contenidos]]

Modelo de dominio. La fuente canónica es el esquema Drizzle `apps/backend-hono/src/db/schema.ts` (módulo 🔒 protegido) y los tipos compartidos `packages/shared-types/src/domain.ts`. Términos en el [[01_Dominio/Glosario|Glosario]].

## Enums

- **`payment_method`:** `stripe` | `cash_presencial` | `trial`.
- **`game_type`** (13 juegos = 4 familias × 3 horarios + Super Premio):
  `diaria_11am`, `diaria_3pm`, `diaria_9pm`, `pega3_11am`, `pega3_3pm`, `pega3_9pm`,
  `premia2_11am`, `premia2_3pm`, `premia2_9pm`, `juga3_11am`, `juga3_3pm`, `juga3_9pm`,
  `super_premio`. El horario es parte de la identidad del juego.

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
| `paymentMethod` | enum | `stripe` \| `cash_presencial` \| `trial` |
| `startDate` | timestamp | def. ahora |
| `endDate` | timestamp | **expiración temporal exacta** |
| `registeredByAdminId` | uuid? | FK → User; auditoría del cobro presencial |
| `receiptNumber` | text? | recibo correlativo físico |

- La **auto-registro** emite suscripciones `trial` al primer login (ver [[05_Procesos/Flujo_Acceso_Premium|Flujo premium]]); las dos últimas columnas solo se rellenan en cobros `cash_presencial`.

## DrawSource (`draw_sources`)
[[04_Modulos/Scraper_Ingestion|Fuente de datos]] configurada por el admin para correlacionar resultados. Una y solo una puede ser primaria.

| Campo | Tipo | Notas |
|---|---|---|
| `id` | uuid | PK |
| `name` | text | obligatorio |
| `baseUrl` | text | URL base de la API |
| `apiFormat` | text | def. `site-games` |
| `enabled` | boolean | def. true |
| `isPrimary` | boolean | def. false (una sola) |
| `lastSuccessAt` | timestamp? | último `health` OK |
| `lastErrorAt` | timestamp? | último `health` con error |
| `lastError` | text? | mensaje (máx. 300) |
| `createdAt` | timestamp | def. ahora |

## IngestionEvent (`ingestion_events`)
[[04_Modulos/Admin_Logs|Evento de log de la ingestión]]: historial cronológico para el panel admin.

| Campo | Tipo | Notas |
|---|---|---|
| `id` | uuid | PK |
| `level` | text | `info` \| `warn` \| `error` (def. info) |
| `sourceId` | uuid? | FK → DrawSource (SET NULL); fuente implicada |
| `game` | enum? | juego implicado (opcional) |
| `message` | text | resumen del evento (máx. 500 en ingesta) |
| `meta` | jsonb? | detalle estructurado (insertados, juegos…) |
| `createdAt` | timestamp | def. ahora; índice para ordenar/filtrar |

## UserFavorite (`user_favorites`)
[[01_Dominio/Glosario|Número marcado]] por el usuario para un juego. Reordenable por drag & drop.

| Campo | Tipo | Notas |
|---|---|---|
| `id` | uuid | PK |
| `userId` | uuid | FK → User (ON DELETE cascade) |
| `game` | enum | juego |
| `number` | text | número (1-2 dígitos, ej. `"07"`) |
| `note` | text? | nota opcional (máx. 500) |
| `position` | integer | def. 0; orden del usuario (**migración `0006`**) |
| `createdAt` | timestamp | def. ahora |

- Restricción `UNIQUE(userId, game, number)`; límite de 100 favoritos por usuario.
- `GET /api/v1/favorites` ordena por `position`; `PATCH /favorites/reorder` actualiza posiciones.

## UserSavedPattern (`user_saved_patterns`)
Combinación de patrones del [[04_Modulos/Patrones|constructor personal]] guardada por el usuario (migración `0006`).

| Campo | Tipo | Notas |
|---|---|---|
| `id` | uuid | PK |
| `userId` | uuid | FK → User (ON DELETE cascade) |
| `name` | text | nombre legible (2-60) |
| `game` | enum | juego objetivo |
| `features` | text[] | `FeatureCode` del motor interactivo (1-7) |
| `isDefault` | boolean | def. false; una predeterminada por usuario |
| `createdAt` | timestamp | def. ahora |

- Restricción `UNIQUE(userId, name)`.
- CRUD en `/api/v1/saved-patterns` (requiere auth).

## Mapa de relaciones (resumen)
- `User 1—N Subscription` (titular) y `User 1—N Subscription` (registrador presencial).
- `LotteryDraw` alimenta el cálculo de `GamePattern` (no hay FK formal: el cálculo es analítico).
- `MetaPattern N—M GamePattern` vía `parentPatternIds`.
- `IngestionEvent N—1 DrawSource` (opcional, `sourceId`).
- `User 1—N UserFavorite` (números guardados) y `User 1—N UserSavedPattern` (combinaciones del constructor).

## Historial de cambios
- 2026-09-05: añadidos `UserFavorite.position` y `UserSavedPattern` (migración `0006_overrated_peter_parker`).
- 2026-09-05: añadidos `payment_method.trial`, entidades `DrawSource` e `IngestionEvent` (migración `0005_ingestion_events`).
- 2026-06-25: **modelo rediseñado a los datos reales.** `game_type` pasa de 4 a 13 juegos. `LotteryDraw`/`lottery_history`: fuera `drawNumber`/`winningNumbers`/`drawTimestamp`; entran `sessionId` (único, idempotencia), `numbers` (text[]), `signs` (text[]), `drawDate`. Migración `0001_redesign_lottery_history`. Ver [[02_Arquitectura/adr/0005-ingestion-github-actions-webshare|ADR-0005]].
- 2026-06-20: creación inicial reflejando `schema.ts` y `shared-types/domain.ts`.

## LotteryDraw (`lottery_history`)
Histórico crudo de sorteos oficiales; objetivo de la [[04_Modulos/Scraper_Ingestion|ingestión]].

| Campo | Tipo | Notas |
|---|---|---|
| `id` | uuid | PK |
| `game` | enum | tipo de juego (13 valores) |
| `sessionId` | text | **único**; clave del sorteo en la fuente → idempotencia |
| `numbers` | text[] | números **como texto**: `"00"`, comodines `"JG"`/`"2X"` |
| `signs` | text[] | imaginario popular embebido: `"00 Avión"`, `"58 Venado"` (puede ir vacío) |
| `drawDate` | timestamp | fecha del sorteo |
| `insertedAt` | timestamp | def. ahora |

> **Por qué texto y no enteros:** la fuente publica `"00"`, comodines (`"JG"`, `"2X"`) y
> signos del imaginario popular. Guardarlos como enteros perdía el núcleo del producto.
> El motor de patrones extrae los tokens numéricos con `toNumericTokens()` (descarta
> comodines, normaliza `"00"→0`); los `signs` alimentan la capa de imaginario popular.
>
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
