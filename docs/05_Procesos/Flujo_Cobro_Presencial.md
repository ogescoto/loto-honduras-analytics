---
tipo: proceso
estado: activo
actualizado: 2026-06-20
---

# Flujo: Cobro presencial en ventanilla

[[00_MAPA_DE_CONTENIDOS|Mapa de Contenidos]]

Caso de uso [[01_Dominio/Casos_de_Uso#CU-03|CU-03]]. Activación de suscripción tras cobrar efectivo. Módulo 🔒 [[04_Modulos/Admin_Cobros_Presenciales|Admin · Cobros presenciales]].

## Actores
- Clerk/Admin (operador de ventanilla), cliente (presente), backend.

## Precondiciones
- El cliente ya está registrado (existe por email).
- El operador cobra el efectivo y emite un recibo físico con número correlativo.

## Secuencia
```mermaid
sequenceDiagram
  participant K as Clerk/Admin
  participant API as backend-hono (admin)
  participant DB as Neon
  K->>API: POST /admin/register-physical-payment {clientEmail, validityMonths, paperReceiptNumber, administratorId}
  API->>DB: SELECT user WHERE email
  alt cliente no existe
    API-->>K: 404 USER_NOT_FOUND
  else cliente existe
    API->>DB: INSERT subscription (cash_presencial, endDate=ahora+meses, registeredByAdminId, receiptNumber)
    API-->>K: 200 { message: acceso activado hasta ... }
  end
```

## Auditoría
- Queda registro de **quién** cobró (`registeredByAdminId`) y **qué recibo** lo respalda (`receiptNumber`).

## Pendiente
- Falta exigir rol admin/clerk vía JWT (`TODO(auth)`) y controlar duplicados/correlatividad del recibo. Ver [[04_Modulos/Admin_Cobros_Presenciales|módulo]].

## Historial de cambios
- 2026-06-20: creación inicial.
