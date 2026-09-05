---
tipo: arquitectura
estado: activo
actualizado: 2026-09-05
---

# Contrato de la API REST

[[00_MAPA_DE_CONTENIDOS|Mapa de Contenidos]]

API del backend `apps/backend-hono` (Cloudflare Workers + Hono). Base: `/api/v1`. Tipos en `packages/shared-types/src/api.ts`. Composición de rutas y middlewares en `apps/backend-hono/src/index.ts`.

## Convención de respuesta
Toda respuesta sigue `ApiResponse<T>`:
```jsonc
// éxito
{ "success": true, "data": { /* ... */ } }
// error
{ "success": false, "error": { "code": "STRING", "message": "texto" } }
```

## Autenticación y autorización
- **Esquema:** `Authorization: Bearer <JWT>`. JWT firmado **HS256** (`hono/jwt`, Web Crypto) con `JWT_SECRET`.
- **Claims:** `{ sub: userId, role: UserRole, exp }`. Ver [[04_Modulos/Suscripciones|Suscripciones]] y `apps/backend-hono/src/middlewares/auth.ts`.
- **Middlewares:** `requireAuth` (verifica el Bearer y deja los claims en `c.get("auth")`), `requireRole(...roles)` (autorización por rol), `requireActiveSubscription` (suscripción vigente, tras `requireAuth`).
- **Códigos de error de auth comunes:** `UNAUTHENTICATED` (401, falta token), `INVALID_TOKEN` (401, inválido/expirado), `FORBIDDEN` (403, rol insuficiente), `SUBSCRIPTION_REQUIRED` (403), `SERVER_MISCONFIGURED` (500, falta `JWT_SECRET`).

---

## GET /health
- **Acceso:** público.
- **Respuesta `200`:** `{ "success": true, "data": { "status": "ok" } }`.

## POST /api/v1/auth/login
Emite un JWT para un usuario existente. Login por **email** (MVP; verificación de contraseña/OTP es mejora futura). Código: `apps/backend-hono/src/routes/auth.ts`.
- **Acceso:** público.
- **Request body:** `{ "email": "cliente@ejemplo.com" }`.
- **Comportamiento:** busca el usuario por email; emite JWT con TTL **1 hora**.
- **Respuesta `200`:** `{ "success": true, "data": { "token": "<JWT>", "user": { "id", "email", "role" } } }`.
- **Errores:** `400 VALIDATION_ERROR` (falta email), `401 INVALID_CREDENTIALS` (email no registrado).

## GET /api/v1/patterns
Patrones de nivel 1. Ver [[04_Modulos/Patrones|Módulo Patrones]] y [[01_Dominio/Casos_de_Uso#CU-01|CU-01]].
- **Acceso:** público / freemium.
- **Respuesta `200`:** `{ "success": true, "data": GamePattern[] }`.
- Cada `GamePattern`: ver [[01_Dominio/Entidades#GamePattern|Entidades]].

## GET /api/v1/premium/meta-patterns
Meta-patrones (nivel 2). Ver [[05_Procesos/Flujo_Acceso_Premium|Flujo premium]] y [[01_Dominio/Casos_de_Uso#CU-02|CU-02]].
- **Acceso:** `requireAuth` + `requireActiveSubscription`. Requiere [[01_Dominio/Glosario#Acceso y cobro|suscripción activa y vigente]].
- **Identificación:** el `userId` se extrae de los claims del JWT (`auth.sub`), **no** del query string.
- **Respuesta `200`:** `{ "success": true, "data": { "generatedAt": ISO, "metaPatterns": MetaPattern[] } }`.
- **Errores:** `401 UNAUTHENTICATED`/`INVALID_TOKEN` (sin token válido), `403 SUBSCRIPTION_REQUIRED` (suscripción inexistente o expirada).

## POST /api/v1/admin/register-physical-payment
Registra un cobro presencial. 🔒 módulo protegido. Ver [[04_Modulos/Admin_Cobros_Presenciales|módulo]] y [[01_Dominio/Casos_de_Uso#CU-03|CU-03]].
- **Acceso:** `requireAuth` + `requireRole("admin", "clerk")`.
- **Request body** (`RegisterPhysicalPaymentDto`):
  ```jsonc
  {
    "clientEmail": "cliente@ejemplo.com",
    "validityMonths": 1,
    "paperReceiptNumber": "REC-000123"
  }
  ```
- **administradorId:** se toma del JWT verificado (`auth.sub`), **no** del body (evita suplantación).
- **Comportamiento:** valida campos obligatorios y `validityMonths > 0`; busca al cliente por email; crea una `Subscription` `cash_presencial` con `endDate = ahora + validityMonths`, `registeredByAdminId` y `receiptNumber`.
- **Respuesta `200`:** `{ "success": true, "data": { "message": "Acceso premium activado para … hasta …" } }`.
- **Errores:** `400 VALIDATION_ERROR` (campos faltantes o `validityMonths <= 0`), `404 USER_NOT_FOUND` (email no registrado), `403 FORBIDDEN` (rol insuficiente).

## PATCH /api/v1/admin/users/:id/role
Cambia el rol de un usuario (`customer | admin | clerk`). Código: `apps/backend-hono/src/routes/admin/users.ts`.
- **Acceso:** `requireAuth` + `requireRole("admin", "clerk")`.
- **Request body:** `{ "role": "clerk" }`.
- **Seguridad:** no se permite a un admin autodemotarse a sí mismo (`FORBIDDEN`), ni que un admin distinto modifique el rol de **otro admin**.
- **Respuesta `200`:** `{ "success": true, "data": { "message": "Rol actualizado a "clerk"." } }`.
- **Errores:** `400 VALIDATION_ERROR` (rol inválido), `404 USER_NOT_FOUND`, `403 FORBIDDEN`.

## PATCH /api/v1/admin/users/:id/subscription
Asigna o renueva un plan premium a un usuario (trial o efectivo) con vencimiento a N meses. Código: `apps/backend-hono/src/routes/admin/users.ts`.
- **Acceso:** `requireAuth` + `requireRole("admin", "clerk")`.
- **Request body:** `{ "method": "trial" | "cash_presencial", "validityMonths": 1..12 }` (`planLabel` opcional se guarda como `receiptNumber` si es efectivo).
- **Comportamiento:** crea una `Subscription` activa con `endDate = ahora + validityMonths` y `registeredByAdminId = auth.sub`.
- **Respuesta `200`:** `{ "success": true, "data": { "message": "Plan … asignado N mes(es) hasta …" } }`.
- **Errores:** `400 VALIDATION_ERROR`, `404 USER_NOT_FOUND`, `403 FORBIDDEN`.

## POST /api/v1/payments/checkout
Inicia una sesión de Stripe Checkout. 🔒 módulo protegido. Ver [[04_Modulos/Pagos|Módulo Pagos]], [[05_Procesos/Flujo_Pago_Online|Flujo de pago online]] y [[02_Arquitectura/adr/0003-pagos-stripe-via-rest-en-edge|ADR-0003]].
- **Acceso:** `requireAuth` (aplicado en la propia ruta).
- **Request body** (`CreateCheckoutDto`): `{ "validityMonths": 1 }`.
- **Comportamiento:** valida `validityMonths > 0`; resuelve el usuario del JWT; crea la sesión Stripe (precio **USD 5.00/mes**, `client_reference_id = userId`); devuelve la URL de pago.
- **Respuesta `200`:** `{ "success": true, "data": { "checkoutUrl": "https://checkout.stripe.com/…" } }`.
- **Errores:** `400 VALIDATION_ERROR`, `404 USER_NOT_FOUND`, `401 UNAUTHENTICATED`/`INVALID_TOKEN`.

## POST /api/v1/payments/webhook
Recibe eventos de Stripe. 🔒 módulo protegido. Ver [[04_Modulos/Pagos|Módulo Pagos]] y [[05_Procesos/Flujo_Pago_Online|Flujo de pago online]].
- **Acceso:** **público pero firmado** — sin JWT; se verifica la firma `stripe-signature` (HMAC-SHA256, Web Crypto, tolerancia 300 s).
- **Request:** cuerpo crudo del evento de Stripe + cabecera `stripe-signature`.
- **Comportamiento:** verifica la firma; ante `checkout.session.completed` crea una `Subscription` `stripe` vigente para el `client_reference_id` con `endDate = ahora + metadata.validityMonths`.
- **Respuesta `200`:** `{ "success": true, "data": { "received": true } }`.
- **Errores:** `400 BAD_REQUEST` (falta firma), `400 INVALID_SIGNATURE` (firma inválida o fuera de tolerancia).

## POST /api/v1/ingest/events
Registra un evento de ingestión (historial para [[04_Modulos/Admin_Logs|Admin · Logs]]). Emisor: el scraper. 🔒 ver protegido.
- **Acceso:** **máquina-a-máquina** — `requireServiceToken` (header `X-Ingest-Token`), no JWT de usuario. Montado en `apps/backend-hono/src/routes/ingest-events.ts`.
- **Request body:**
  ```jsonc
  {
    "level": "info",            // info | warn | error (def. info)
    "sourceId": "uuid?",        // debe existir en draw_sources
    "game": "diaria_9pm?",      // game_type (13 valores)
    "message": "Fuente X OK",   // obligatorio, máx. 500
    "meta": { "inserted": 3 }   // jsonb opcional
  }
  ```
- **Respuesta `200`:** `{ "success": true, "data": { "id", "createdAt" } }`.
- **Errores:** `400 VALIDATION_ERROR` (sin `message`), `404 NOT_FOUND` (sourceId inexistente), `401 UNAUTHENTICATED` (token de servicio ausente/inválido).

## GET /api/v1/admin/logs
Lista eventos de ingestión para el panel admin. Ver [[04_Modulos/Admin_Logs|módulo]]. Código: `apps/backend-hono/src/routes/admin/logs.ts`.
- **Acceso:** `requireAuth` + `requireRole("admin", "clerk")`.
- **Query params:** `level` (info|warn|error), `game` (game_type), `limit` (def. 100, máx. 500), `offset`.
- **Respuesta `200`:** `{ "success": true, "data": [{ "id", "level", "message", "game", "meta", "createdAt", "sourceId", "sourceName" }] }` ordenado por `createdAt` desc.
- **Errores:** `401 UNAUTHENTICATED`, `403 FORBIDDEN`.

## GET /api/v1/history
Historial de sorteos. Ver [[04_Modulos/Frontend|Frontend]]. Código: `apps/backend-hono/src/routes/history.ts`.
- **Acceso:** público.
- **Query params:** `game` (un juego o familia `all_*`), `days` (1-90, def. 10), `order` (`asc`|`desc`).
- **Respuesta `200`:** `{ "success": true, "data": LotteryDraw[] }`.

## GET /api/v1/favorites
Lista favoritos del usuario (reordenables). Código: `apps/backend-hono/src/routes/favorites.ts`.
- **Acceso:** `requireAuth`.
- **Respuesta `200`:** `{ "success": true, "data": UserFavorite[] }` ordenado por `position`.

## POST /api/v1/favorites
Guarda un número como favorito.
- **Acceso:** `requireAuth`. **Body:** `{ "game", "number", "note?" }`. `number` = 1-2 dígitos.
- **Respuestas:** `201` con el `UserFavorite`; `409 ALREADY_EXISTS` (ya guardado); `400 VALIDATION_ERROR`; `400 LIMIT_EXCEEDED` (>100).

## PATCH /api/v1/favorites/reorder
Reordena favoritos por drag & drop.
- **Acceso:** `requireAuth`. **Body:** `{ "ids": ["uuid", ...] }` (orden final de los favoritos; todos deben pertenecer al usuario).
- **Respuestas:** `200`; `400 VALIDATION_ERROR`; `403 FORBIDDEN` si algún id no es del usuario.

## DELETE /api/v1/favorites/:id
Elimina un favorito del usuario autenticado.
- **Acceso:** `requireAuth`. **Respuestas:** `200`; `404 NOT_FOUND`.

## GET /api/v1/saved-patterns
Lista combinaciones de patrones guardadas por el usuario (constructor personal). Código: `apps/backend-hono/src/routes/saved-patterns.ts`.
- **Acceso:** `requireAuth`.
- **Respuesta `200`:** `{ "success": true, "data": UserSavedPattern[] }`.

## POST /api/v1/saved-patterns
Guarda una combinación de patrones. Ver [[04_Modulos/Patrones|Patrones]].
- **Acceso:** `requireAuth`. **Body:** `{ "name": "2-60 chars", "game": GameType, "features": FeatureCode[1-7] }`.
- **Respuestas:** `201` con la combinación; `400 VALIDATION_ERROR`.

## PATCH /api/v1/saved-patterns/:id
Actualiza nombre, `features` o marca `isDefault` (al marcarla, las demás quedan `false`).
- **Acceso:** `requireAuth`. **Body:** parcial `{ "name?", "features?", "isDefault?" }`.
- **Respuestas:** `200`; `404 NOT_FOUND`; `400 VALIDATION_ERROR`.

## DELETE /api/v1/saved-patterns/:id
Elimina la combinación del usuario.
- **Acceso:** `requireAuth`. **Respuestas:** `200`; `404 NOT_FOUND`.

## Historial de cambios
- 2026-09-05: documentados `GET/POST /favorites`, `PATCH /favorites/reorder`, `DELETE /favorites/:id` y CRUD `/saved-patterns`; `MAX_DAYS` de historial sube a 90.
- 2026-09-05: añadidos `PATCH /api/v1/admin/users/:id/role` y `PATCH /api/v1/admin/users/:id/subscription` (gestión de roles y planes desde admin); documentados `POST /api/v1/ingest/events` y `GET /api/v1/admin/logs`.
- 2026-06-21: documentado auth Bearer JWT + RBAC; añadidos `POST /auth/login`, `POST /payments/checkout` y `POST /payments/webhook`; `premium/meta-patterns` y `admin/register-physical-payment` ahora toman la identidad del JWT (eliminado `userId` por query y `administratorId` del body); añadidos códigos de error.
- 2026-06-20: documentación inicial de `/health`, `patterns`, `premium/meta-patterns` y `admin/register-physical-payment`.
