---
tipo: modulo
modulo: suscripciones
estado: activo
actualizado: 2026-06-20
---

# Módulo: Suscripciones

[[00_MAPA_DE_CONTENIDOS|Mapa de Contenidos]]

## Responsabilidad
Controlar el **acceso premium de tiempo limitado** mediante [[01_Dominio/Glosario#Acceso y cobro|suscripciones híbridas]] (`stripe` o `cash_presencial`) y verificar su vigencia en cada petición premium.

## Lenguaje ubicuo
- **Suscripción híbrida, suscripción activa y vigente:** ver [[01_Dominio/Glosario|Glosario]].

## Dependencias
- [[04_Modulos/Admin_Cobros_Presenciales|Admin · Cobros presenciales]] (crea suscripciones `cash_presencial`).
- Stripe (vía `payments/`, **previsto**, aún no implementado).
- `packages/shared-types` (`Subscription`, `PaymentMethod`).

## API pública
- **Middleware:** `requireActiveSubscription` — `apps/backend-hono/src/middlewares/require-active-subscription.ts`. Exige `isActive = true` **y** `endDate > ahora`; si no, responde `401 UNAUTHENTICATED` o `403 SUBSCRIPTION_REQUIRED`.
- Protege la ruta premium ([[02_Arquitectura/API#GET /api/v1/premium/meta-patterns|meta-patterns]]).

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
- El `userId` se toma del **query** (andamiaje); en producción debe extraerse del **JWT** verificado.
- El flujo de pago **Stripe** (`payments/`) y la renovación/cancelación de suscripciones no están implementados.

## Historial de cambios
- 2026-06-20: creación inicial.
