---
tipo: adr
estado: aceptado
actualizado: 2026-06-21
---

# ADR-0003: Pagos con Stripe vía API REST en el edge

[[00_MAPA_DE_CONTENIDOS|Mapa de Contenidos]]

- **Estado:** Aceptado
- **Fecha:** 2026-06-21
- **Decisores:** Tech Lead
- **Relacionado:** [[02_Arquitectura/adr/0002-arquitectura-edge-cloudflare|ADR-0002]], [[04_Modulos/Pagos|Módulo Pagos]], [[05_Procesos/Flujo_Pago_Online|Flujo de pago online]], [[03_Tecnico/Stack|Stack]]

## Contexto
El backend corre sobre **Cloudflare Workers** (V8 isolates, sin APIs Node completas). Necesitamos cobrar suscripciones premium con Stripe (Checkout + webhook). El **SDK oficial de Stripe para Node** depende de módulos del runtime de Node (p. ej. `http`/`crypto` de Node) que no están disponibles —o no son fiables— en el edge, y su verificación de firma de webhook usa `crypto` de Node.

## Decisión
Integrar Stripe **sin SDK de Node**, usando primitivas compatibles con Workers:
- **Checkout:** llamadas directas a la **API REST de Stripe** (`https://api.stripe.com/v1`) vía `fetch`, con cuerpo `application/x-www-form-urlencoded` (`createCheckoutSession`).
- **Webhook:** verificación de la firma `stripe-signature` (esquema v1, **HMAC-SHA256**) con **Web Crypto** (`crypto.subtle`), incluyendo ventana de tolerancia temporal (`verifyWebhook`).
- Código aislado en `apps/backend-hono/src/payments/` (módulo 🔒 protegido).

## Alternativas consideradas
- **SDK oficial de Stripe (Node):** ergonomía y tipado completos, pero incompatible/no fiable en Workers por dependencias de Node. Descartada.
- **`stripe` con adaptador Fetch + `Stripe.createSubtleCryptoProvider`:** viable, pero añade peso de dependencia y superficie innecesaria para el alcance actual (solo checkout + un evento). Descartada a favor de un cliente mínimo propio.
- **Proxy/función Node intermedia para pagos:** reintroduce un servidor a administrar, contradiciendo [[02_Arquitectura/adr/0002-arquitectura-edge-cloudflare|ADR-0002]]. Descartada.

## Consecuencias
- (+) Compatible con el runtime edge; sin dependencias de Node.
- (+) Superficie mínima y auditable; control total sobre la verificación de firma.
- (+) Coherente con la arquitectura edge (ADR-0002).
- (−) Mantenemos manualmente el mapeo de campos de la API REST de Stripe (sin tipos del SDK).
- (−) Funcionalidad acotada: hoy cubre checkout y `checkout.session.completed`; ampliar eventos exige más código propio.
- **Impacto en:** módulo [[04_Modulos/Pagos|Pagos]] y [[04_Modulos/Suscripciones|Suscripciones]] (activación `stripe`).
- **Reversibilidad:** alta — el módulo está aislado; cambiar a un SDK compatible afectaría solo a `payments/`.

## Seguimiento
- [x] Implementar `createCheckoutSession` (REST) y `verifyWebhook` (Web Crypto).
- [ ] Idempotencia del webhook (deduplicar por `event.id`).
- [ ] Soporte de reembolsos/renovación cuando el producto lo requiera.
