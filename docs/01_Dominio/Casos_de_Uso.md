---
tipo: dominio
estado: activo
actualizado: 2026-06-20
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
- **Disparador:** `GET /api/v1/premium/meta-patterns`.
- **Resultado:** lista de [[01_Dominio/Entidades#MetaPattern|MetaPattern]]; si no hay suscripción válida → `403`.
- **Acceso:** middleware `require-active-subscription`.
- Ver: [[05_Procesos/Flujo_Acceso_Premium|Flujo de acceso premium]].

## CU-03 · Registrar cobro presencial en ventanilla
- **Actor:** admin o clerk.
- **Objetivo:** activar una suscripción tras cobrar efectivo en ventanilla, dejando auditoría.
- **Precondición:** el cliente ya existe (por email); el operador cobra y emite recibo correlativo.
- **Disparador:** `POST /api/v1/admin/register-physical-payment`.
- **Resultado:** se crea una [[01_Dominio/Entidades#Subscription|Subscription]] `cash_presencial` con `endDate`, `registeredByAdminId` y `receiptNumber`.
- **Acceso:** módulo 🔒 protegido; debe exigir rol admin/clerk (control de fraude).
- Ver: [[05_Procesos/Flujo_Cobro_Presencial|Flujo de cobro presencial]].

## CU-04 · Ingestión periódica de sorteos
- **Actor:** sistema (Cloudflare Scheduled Worker `scraper-cron`).
- **Objetivo:** mantener al día el histórico de sorteos.
- **Disparador:** evento cron programado.
- **Proceso:** descarga vía Scrapoxy → parseo → *upsert* idempotente en [[01_Dominio/Entidades#LotteryDraw|lottery_history]] → habilita recálculo de patrones.
- **Resultado:** nuevos sorteos persistidos sin duplicar (`drawNumber` único).
- Ver: [[05_Procesos/Flujo_Ingestion_Scraping|Flujo de ingestión]], [[04_Modulos/Scraper_Ingestion|Módulo scraper]].

## Historial de cambios
- 2026-06-20: creación inicial.
