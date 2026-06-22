---
tipo: modulo
modulo: pagos
estado: activo
actualizado: 2026-06-21
---

# Módulo: Pagos (Stripe)

[[00_MAPA_DE_CONTENIDOS|Mapa de Contenidos]]

## Responsabilidad
Cobrar **suscripciones premium online** mediante **Stripe Checkout** y activar la [[01_Dominio/Entidades#Subscription|Subscription]] correspondiente al confirmarse el pago. Maneja dinero real y datos sensibles a PCI.

## Lenguaje ubicuo
- **Suscripción híbrida (`stripe`):** ver [[01_Dominio/Glosario|Glosario]] y [[04_Modulos/Suscripciones|Suscripciones]].

## Dependencias
- Stripe (API REST, vía `fetch`; sin SDK de Node). Ver [[02_Arquitectura/adr/0003-pagos-stripe-via-rest-en-edge|ADR-0003]].
- [[04_Modulos/Suscripciones|Suscripciones]] (el webhook inserta la suscripción `stripe`).
- `requireAuth` ([[04_Modulos/Suscripciones#Autenticación (JWT + RBAC)|auth]]) para el checkout.
- `packages/shared-types` (`CreateCheckoutDto`).

## API pública
- **`POST /api/v1/payments/checkout`** (requiere `requireAuth`): crea una sesión de Stripe Checkout. Precio **USD 5.00/mes**, `client_reference_id = userId`. Devuelve `checkoutUrl`. Ver [[02_Arquitectura/API#POST /api/v1/payments/checkout|API]].
- **`POST /api/v1/payments/webhook`** (público pero **firmado**): verifica la firma de Stripe; ante `checkout.session.completed` crea una suscripción `stripe` vigente para el `client_reference_id`. Ver [[02_Arquitectura/API#POST /api/v1/payments/webhook|API]].
- Código: `apps/backend-hono/src/payments/routes.ts`.

## Implementación
`apps/backend-hono/src/payments/stripe-client.ts`:
- `createCheckoutSession(apiKey, params)`: POST a `https://api.stripe.com/v1/checkout/sessions` con cuerpo `x-www-form-urlencoded` y `line_items` con `price_data` dinámico.
- `verifyWebhook(payload, sigHeader, secret, tolerance=300s)`: verifica la firma `stripe-signature` v1 (HMAC-SHA256 con **Web Crypto**) y la ventana temporal; devuelve el evento parseado o lanza.

## Entidades principales
- [[01_Dominio/Entidades#Subscription|Subscription]] (`paymentMethod = "stripe"`, sin `registeredByAdminId`/`receiptNumber`).

## Decisiones técnicas relevantes
- [[02_Arquitectura/adr/0003-pagos-stripe-via-rest-en-edge|ADR-0003]]: Stripe vía REST + Web Crypto en el edge (compatibilidad con Workers).

## Flujos relacionados
- [[05_Procesos/Flujo_Pago_Online|Pago online (Stripe)]].
- Tras la activación, el acceso sigue el [[05_Procesos/Flujo_Acceso_Premium|flujo premium]].

## Protección
- Estado en `.aicodeprotect.yml`: **🔒 protegido** — `apps/backend-hono/src/payments/**` (flujos de pago, PCI). Cambios requieren `APPROVED`.

## Variables de entorno
- `STRIPE_API_KEY`, `STRIPE_WEBHOOK_SECRET`, `APP_BASE_URL`.

## Pendiente / no documentado
- No hay **idempotencia** explícita ante reentrega del webhook (podría duplicar suscripciones); falta deduplicar por `event.id`/sesión.
- Sin manejo de **reembolsos**, fallos de pago ni renovación automática.

## Historial de cambios
- 2026-06-21: creación — módulo Stripe implementado (checkout + webhook firmado), cliente REST con Web Crypto.
