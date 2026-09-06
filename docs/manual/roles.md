---
tipo: manual
estado: activo
actualizado: 2026-09-05
---

# Roles de usuario

[[manual/index|Índice del manual]] · [[00_MAPA_DE_CONTENIDOS|Mapa de Contenidos]]

Loto Honduras Analytics tiene tres tipos de usuario. El rol se guarda en el campo `role` del usuario. Desde el panel **Admin** (rol `admin`/`clerk`) se puede cambiar el rol de un usuario y **asignar un plan** (trial o efectivo) por un número de meses.

| Rol | Puede... |
|---|---|
| **Cliente** (`customer`) | Consultar patrones de nivel 1 (fríos/calientes, rachas inversas, par/impar, guía de los sueños); usar la pantalla de análisis de patrones (Candidatos/Historial/Guía/Guardados); suscribirse; y, con suscripción vigente, ver los meta-patrones premium. |
| **Administrador** (`admin`) | Todo lo del cliente, además de gestionar el sistema: **cambiar roles**, **asignar planes**, y **registrar cobros presenciales** en ventanilla. |
| **Clerk** (ventanilla) | **Registrar cobros presenciales** y **asignar planes**: cobra el efectivo del cliente, emite el recibo con número correlativo y activa su suscripción. |

## Notas
- El acceso al contenido premium depende de tener una **suscripción activa y vigente**, no del rol. Ver [[manual/index#Conceptos clave|conceptos clave]].
- El registro de cobros presenciales y la asignación de planes quedan **auditados** (operador que lo hizo + vencimiento).
- Un administrador no puede cambiarse el rol a sí mismo, ni modificar el rol de otro administrador.

## Historial de cambios
- 2026-09-05: añadida la gestión de roles y asignación de planes desde Admin.
- 2026-06-20: creación inicial.
