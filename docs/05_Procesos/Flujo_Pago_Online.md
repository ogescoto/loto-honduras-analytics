---
tipo: proceso
estado: activo
actualizado: 2026-06-21
---

# Flujo: Pago online (Stripe)

[[00_MAPA_DE_CONTENIDOS|Mapa de Contenidos]]

Cómo un cliente compra una suscripción premium con tarjeta vía **Stripe Checkout**. Módulo 🔒 [[04_Modulos/Pagos|Pagos]]. Decisión en [[02_Arquitectura/adr/0003-pagos-stripe-via-rest-en-edge|ADR-0003]].

## Actores
- Cliente autenticado (frontend), backend (`payments`), Stripe.

## Secuencia
```mermaid
sequenceDiagram
  participant C as Cliente (frontend)
  participant API as backend-hono (payments)
  participant S as Stripe
  C->>API: POST /api/v1/payments/checkout (Bearer JWT) { validityMonths }
  API->>API: requireAuth + valida validityMonths > 0
  API->>S: createCheckoutSession (REST, USD 5.00/mes, client_reference_id=userId)
  S-->>API: { url }
  API-->>C: 200 { checkoutUrl }
  C->>S: paga en Stripe Checkout
  S->>API: POST /api/v1/payments/webhook (stripe-signature)
  API->>API: verifyWebhook (HMAC-SHA256, Web Crypto, tolerancia 300s)
  alt firma inválida / fuera de tolerancia
    API-->>S: 400 INVALID_SIGNATURE
  else checkout.session.completed
    API->>API: INSERT subscription (stripe, endDate=ahora+validityMonths)
    API-->>S: 200 { received: true }
  end
```

## Reglas
- El **checkout** exige `requireAuth`; el `userId` (claim `sub`) viaja como `client_reference_id`.
- El **webhook** es público pero solo se procesa si la **firma** de Stripe es válida y reciente.
- Solo `checkout.session.completed` activa la suscripción (`paymentMethod = "stripe"`).
- Tras la activación, el acceso sigue el [[05_Procesos/Flujo_Acceso_Premium|flujo premium]].

## Pendiente
- **Idempotencia del webhook** (deduplicar por `event.id`/sesión) y manejo de reembolsos/renovación. Ver [[04_Modulos/Pagos|módulo]].

## Historial de cambios
- 2026-06-21: creación — flujo Stripe checkout → webhook firmado → suscripción.
