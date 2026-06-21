---
tipo: arquitectura
estado: activo
actualizado: 2026-06-20
---

# Contrato de la API REST

[[00_MAPA_DE_CONTENIDOS|Mapa de Contenidos]]

API del backend `apps/backend-hono` (Cloudflare Workers + Hono). Base: `/api/v1`. Tipos en `packages/shared-types/src/api.ts`.

## Convención de respuesta
Toda respuesta sigue `ApiResponse<T>`:
```jsonc
// éxito
{ "success": true, "data": { /* ... */ } }
// error
{ "success": false, "error": { "code": "STRING", "message": "texto" } }
```

---

## GET /health
- **Acceso:** público.
- **Respuesta `200`:** `{ "success": true, "data": { "status": "ok" } }`.

## GET /api/v1/patterns
Patrones de nivel 1. Ver [[04_Modulos/Patrones|Módulo Patrones]] y [[01_Dominio/Casos_de_Uso#CU-01|CU-01]].
- **Acceso:** público / freemium.
- **Respuesta `200`:** `{ "success": true, "data": GamePattern[] }`.
- Cada `GamePattern`: ver [[01_Dominio/Entidades#GamePattern|Entidades]].

## GET /api/v1/premium/meta-patterns
Meta-patrones (nivel 2). Ver [[05_Procesos/Flujo_Acceso_Premium|Flujo premium]] y [[01_Dominio/Casos_de_Uso#CU-02|CU-02]].
- **Acceso:** requiere [[01_Dominio/Glosario#Acceso y cobro|suscripción activa y vigente]]. Middleware `require-active-subscription`.
- **Identificación:** `userId` por query (andamiaje). **En producción se extrae del JWT verificado**, no del query.
- **Respuesta `200`:** `{ "success": true, "data": { "generatedAt": ISO, "metaPatterns": MetaPattern[] } }`.
- **Errores:**
  - `401 UNAUTHENTICATED` — falta identificación de usuario.
  - `403 SUBSCRIPTION_REQUIRED` — la suscripción no existe o ha expirado.

## POST /api/v1/admin/register-physical-payment
Registra un cobro presencial. 🔒 módulo protegido. Ver [[04_Modulos/Admin_Cobros_Presenciales|módulo]] y [[01_Dominio/Casos_de_Uso#CU-03|CU-03]].
- **Acceso:** admin / clerk. *Pendiente: el control de rol vía JWT está marcado como `TODO(auth)` en el código.*
- **Request body** (`RegisterPhysicalPaymentDto` + `administratorId`):
  ```jsonc
  {
    "clientEmail": "cliente@ejemplo.com",
    "validityMonths": 1,
    "paperReceiptNumber": "REC-000123",
    "administratorId": "uuid-del-operador"
  }
  ```
- **Comportamiento:** busca al cliente por email; crea una `Subscription` `cash_presencial` con `endDate = ahora + validityMonths`, `registeredByAdminId` y `receiptNumber`.
- **Respuesta `200`:** `{ "success": true, "data": { "message": "Acceso premium activado para … hasta …" } }`.
- **Errores:**
  - `404 USER_NOT_FOUND` — el email no corresponde a un usuario registrado.

## Historial de cambios
- 2026-06-20: documentación inicial de `/health`, `patterns`, `premium/meta-patterns` y `admin/register-physical-payment`.
