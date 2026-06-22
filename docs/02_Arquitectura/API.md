---
tipo: arquitectura
estado: activo
actualizado: 2026-06-21
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

## Historial de cambios
- 2026-06-21: documentado auth Bearer JWT + RBAC; añadidos `POST /auth/login`, `POST /payments/checkout` y `POST /payments/webhook`; `premium/meta-patterns` y `admin/register-physical-payment` ahora toman la identidad del JWT (eliminado `userId` por query y `administratorId` del body); añadidos códigos de error.
- 2026-06-20: documentación inicial de `/health`, `patterns`, `premium/meta-patterns` y `admin/register-physical-payment`.
