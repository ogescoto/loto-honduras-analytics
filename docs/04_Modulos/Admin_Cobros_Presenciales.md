---
tipo: modulo
modulo: admin-cobros-presenciales
estado: activo
actualizado: 2026-06-20
---

# Módulo: Admin · Cobros presenciales

[[00_MAPA_DE_CONTENIDOS|Mapa de Contenidos]]

## Responsabilidad
Permitir a un **admin o clerk** activar una suscripción tras cobrar **efectivo en ventanilla**, dejando rastro de auditoría (operador y recibo correlativo). Maneja dinero real: sensible a fraude.

## Lenguaje ubicuo
- **Cobro presencial, recibo correlativo, clerk:** ver [[01_Dominio/Glosario|Glosario]].

## Dependencias
- [[04_Modulos/Suscripciones|Suscripciones]] (inserta una `Subscription` `cash_presencial`).
- `packages/shared-types` (`RegisterPhysicalPaymentDto`).

## API pública
- **Comando:** `POST /api/v1/admin/register-physical-payment`. Ver [[02_Arquitectura/API#POST /api/v1/admin/register-physical-payment|API]].
- Código: `apps/backend-hono/src/routes/admin/physical-payments.ts`.
- Efecto: busca cliente por email → crea suscripción con `endDate = ahora + validityMonths`, `registeredByAdminId`, `receiptNumber`.

## Entidades principales
- [[01_Dominio/Entidades#Subscription|Subscription]] (campos `registeredByAdminId`, `receiptNumber`), [[01_Dominio/Entidades#User|User]].

## Decisiones técnicas relevantes
- [[02_Arquitectura/adr/0001-adopcion-del-framework-de-gobernanza|ADR-0001]]: zona declarada protegida por su sensibilidad.

## Flujos relacionados
- [[05_Procesos/Flujo_Cobro_Presencial|Cobro presencial en ventanilla]].

## Protección
- Estado en `.aicodeprotect.yml`: **🔒 protegido** — `apps/backend-hono/src/routes/admin/**`. Requiere análisis de impacto + `APPROVED` del Tech Lead.

## Pendiente / no documentado
- El control de **rol admin/clerk vía JWT** está marcado como `TODO(auth)`: hoy el endpoint no verifica el rol del solicitante.
- No hay validación de unicidad/correlatividad del `receiptNumber` ni control de duplicados de cobro.

## Historial de cambios
- 2026-06-20: creación inicial.
