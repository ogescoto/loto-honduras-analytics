---
tipo: modulo
modulo: suscripciones
estado: activo
actualizado: 2026-06-21
---

# Módulo: Suscripciones

[[00_MAPA_DE_CONTENIDOS|Mapa de Contenidos]]

## Responsabilidad
Controlar el **acceso premium de tiempo limitado** mediante [[01_Dominio/Glosario#Acceso y cobro|suscripciones híbridas]] (`stripe` o `cash_presencial`) y verificar su vigencia en cada petición premium.

## Lenguaje ubicuo
- **Suscripción híbrida, suscripción activa y vigente:** ver [[01_Dominio/Glosario|Glosario]].

## Dependencias
- [[04_Modulos/Admin_Cobros_Presenciales|Admin · Cobros presenciales]] (crea suscripciones `cash_presencial`).
- [[04_Modulos/Pagos|Pagos (Stripe)]] (crea suscripciones `stripe` desde el webhook de pago).
- `packages/shared-types` (`Subscription`, `PaymentMethod`).

## Autenticación (JWT + RBAC)
Implementada en `apps/backend-hono/src/middlewares/auth.ts`:
- `requireAuth`: verifica el Bearer JWT (HS256 vía `hono/jwt`/Web Crypto, secreto `JWT_SECRET`) y deja los claims `{ sub, role, exp }` en `c.get("auth")`.
- `requireRole(...roles)`: autorización por rol (`403 FORBIDDEN` si no coincide).
- Emisión del token: `POST /api/v1/auth/login` (`apps/backend-hono/src/routes/auth.ts`), TTL 1 hora.

## API pública
- **Middleware:** `requireActiveSubscription` — `apps/backend-hono/src/middlewares/require-active-subscription.ts`. Toma el `userId` de **`auth.sub` (JWT)**; exige `isActive = true` **y** `endDate > ahora`; si no, responde `401 UNAUTHENTICATED` o `403 SUBSCRIPTION_REQUIRED`. Debe ejecutarse después de `requireAuth`.
- Protege la ruta premium ([[02_Arquitectura/API#GET /api/v1/premium/meta-patterns|meta-patterns]]), encadenado en `index.ts`: `requireAuth` + `requireActiveSubscription`.

## Entidades principales
- [[01_Dominio/Entidades#Subscription|Subscription]].

## Decisiones técnicas relevantes
- [[02_Arquitectura/adr/0002-arquitectura-edge-cloudflare|ADR-0002]]: verificación de acceso en el edge contra Neon.

## Flujos relacionados
- [[05_Procesos/Flujo_Acceso_Premium|Acceso a meta-patrones premium]].
- [[05_Procesos/Flujo_Cobro_Presencial|Cobro presencial]].

## Protección
- Estado en `.aicodeprotect.yml`: **🔒 protegido** — `apps/backend-hono/src/middlewares/**` (RBAC de suscripciones) y `apps/backend-hono/src/payments/**`. Cambios requieren `APPROVED`.

## Pendiente / no documentado
- **Renovación/cancelación** de suscripciones y gestión de duplicados/solapamientos de períodos aún no implementadas.
- El login es por email (sin contraseña/OTP); endurecerlo es mejora futura.

## Historial de cambios
- 2026-06-21: documentada la auth JWT + RBAC implementada (`requireAuth`, `requireRole`, `auth/login`); `requireActiveSubscription` ahora toma el `userId` del JWT (eliminado el query); añadida dependencia del módulo Pagos (Stripe) implementado. Resueltos los pendientes de auth y de Stripe.
- 2026-06-20: creación inicial.
