---
tipo: dominio
estado: activo
actualizado: 2026-06-21
---

# Casos de uso

[[00_MAPA_DE_CONTENIDOS|Mapa de Contenidos]]

Casos de uso principales del sistema. Cada uno enlaza a su módulo, flujo y endpoint.

## CU-01 · Consultar patrones de nivel 1
- **Actor:** cliente (incluso anónimo / freemium).
- **Objetivo:** ver patrones de datos duros e imaginario popular (fríos/calientes, rachas inversas, par/impar, numerología de sueños).
- **Disparador:** abrir el dashboard o llamar `GET /api/v1/patterns`.
- **Resultado:** lista de [[01_Dominio/Entidades#GamePattern|GamePattern]] del juego.
- **Acceso:** público / freemium, sin suscripción.
- Ver: [[04_Modulos/Patrones|Módulo Patrones]], [[02_Arquitectura/API#GET /api/v1/patterns|API]].

## CU-02 · Acceder a meta-patrones premium
- **Actor:** cliente con suscripción.
- **Objetivo:** ver los meta-patrones psico-estadísticos de mayor valor.
- **Precondición:** [[01_Dominio/Glosario#Acceso y cobro|suscripción activa y vigente]] (`isActive` y `endDate > ahora`).
- **Disparador:** `GET /api/v1/premium/meta-patterns` (con Bearer JWT).
- **Resultado:** lista de [[01_Dominio/Entidades#MetaPattern|MetaPattern]]; si no hay suscripción válida → `403`.
- **Acceso:** `requireAuth` + `require-active-subscription` (identidad desde el JWT).
- Ver: [[05_Procesos/Flujo_Acceso_Premium|Flujo de acceso premium]].

## CU-03 · Registrar cobro presencial en ventanilla
- **Actor:** admin o clerk.
- **Objetivo:** activar una suscripción tras cobrar efectivo en ventanilla, dejando auditoría.
- **Precondición:** el cliente ya existe (por email); el operador cobra y emite recibo correlativo.
- **Disparador:** `POST /api/v1/admin/register-physical-payment`.
- **Resultado:** se crea una [[01_Dominio/Entidades#Subscription|Subscription]] `cash_presencial` con `endDate`, `registeredByAdminId` (del JWT) y `receiptNumber`.
- **Acceso:** módulo 🔒 protegido; `requireAuth` + `requireRole("admin","clerk")` (control de fraude).
- Ver: [[05_Procesos/Flujo_Cobro_Presencial|Flujo de cobro presencial]].

## CU-05 · Comprar suscripción premium online (Stripe)
- **Actor:** cliente autenticado.
- **Objetivo:** activar el acceso premium pagando con tarjeta.
- **Precondición:** usuario autenticado (JWT vía `auth/login`).
- **Disparador:** `POST /api/v1/payments/checkout` → paga en Stripe → `POST /api/v1/payments/webhook`.
- **Resultado:** al confirmarse el pago (`checkout.session.completed`), se crea una [[01_Dominio/Entidades#Subscription|Subscription]] `stripe` vigente (USD 5.00/mes).
- **Acceso:** módulo 🔒 protegido [[04_Modulos/Pagos|Pagos]]; checkout con `requireAuth`, webhook firmado.
- Ver: [[05_Procesos/Flujo_Pago_Online|Flujo de pago online]], [[02_Arquitectura/adr/0003-pagos-stripe-via-rest-en-edge|ADR-0003]].

## CU-06 · Calcular y persistir patrones
- **Actor:** sistema (motor de patrones).
- **Objetivo:** generar los patrones nivel 1 y meta-patrones a partir del histórico.
- **Disparador:** ejecución de `computePatternsForGame` (tras la ingestión / periódica).
- **Proceso:** ventanas 30/90/365 días (fríos/calientes, rachas inversas, par/impar) + cruce de calientes con números de sueños/búsquedas en tendencia.
- **Resultado:** filas en `game_patterns` y `meta_patterns`, consumidas por CU-01 y CU-02.
- Ver: [[04_Modulos/Patrones|Módulo Patrones]].

## CU-04 · Ingestión periódica de sorteos
- **Actor:** sistema (Cloudflare Scheduled Worker `scraper-cron`).
- **Objetivo:** mantener al día el histórico de sorteos.
- **Disparador:** evento cron programado.
- **Proceso:** descarga vía Scrapoxy → parseo → *upsert* idempotente en [[01_Dominio/Entidades#LotteryDraw|lottery_history]] → habilita recálculo de patrones.
- **Resultado:** nuevos sorteos persistidos sin duplicar (`drawNumber` único).
- Ver: [[05_Procesos/Flujo_Ingestion_Scraping|Flujo de ingestión]], [[04_Modulos/Scraper_Ingestion|Módulo scraper]].

## Historial de cambios
- 2026-06-21: añadidos CU-05 (pago online Stripe) y CU-06 (cálculo de patrones); actualizados accesos de CU-02 y CU-03 a auth JWT + RBAC.
- 2026-06-20: creación inicial.
