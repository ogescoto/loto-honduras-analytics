---
tipo: proceso
estado: activo
actualizado: 2026-06-21
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
  participant AU as requireAuth + requireRole(admin,clerk)
  participant DB as Neon
  K->>API: POST /admin/register-physical-payment (Bearer JWT) {clientEmail, validityMonths, paperReceiptNumber}
  API->>AU: verifica JWT y rol
  alt token inválido / rol insuficiente
    AU-->>K: 401 UNAUTHENTICATED / 403 FORBIDDEN
  else autorizado
    AU->>API: claims {sub=administradorId, role}
    API->>API: valida campos y validityMonths > 0
    API->>DB: SELECT user WHERE email
    alt cliente no existe
      API-->>K: 404 USER_NOT_FOUND
    else cliente existe
      API->>DB: INSERT subscription (cash_presencial, endDate=ahora+meses, registeredByAdminId=auth.sub, receiptNumber)
      API-->>K: 200 { message: acceso activado hasta ... }
    end
  end
```

## Auditoría
- El operador (`registeredByAdminId`) se toma del **JWT verificado**, no del body: no es suplantable.
- Queda registro de **quién** cobró y **qué recibo** lo respalda (`receiptNumber`).

## Pendiente
- Controlar duplicados/correlatividad del recibo (sin validar a nivel de BD). Ver [[04_Modulos/Admin_Cobros_Presenciales|módulo]].

## Historial de cambios
- 2026-06-21: el flujo exige `requireAuth` + `requireRole("admin","clerk")` y deriva el `administradorId` del JWT; añadida validación de campos. Resuelto el `TODO(auth)`.
- 2026-06-20: creación inicial.
