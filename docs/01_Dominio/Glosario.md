---
tipo: dominio
estado: activo
actualizado: 2026-06-20
---

# Glosario — Lenguaje ubicuo

[[00_MAPA_DE_CONTENIDOS|Mapa de Contenidos]]

Vocabulario común del negocio. Estos términos se usan igual en el código, la API y la documentación.

## Patrones

- **Patrón de nivel 1:** unidad analítica de primer orden basada en *datos duros* (estadística de sorteos) o en el *imaginario popular*. Acceso público / freemium. En el modelo es [[01_Dominio/Entidades#GamePattern|GamePattern]].
- **Meta-patrón (nivel 2):** patrón de segundo orden que **cruza** varios patrones de nivel 1 (estadística + búsquedas/sueños). Es el contenido de mayor valor; queda **bloqueado tras suscripción premium**. En el modelo es [[01_Dominio/Entidades#MetaPattern|MetaPattern]].
- **Coincidencia psico-estadística:** meta-patrón que se forma cuando un número "caliente" coincide con un aumento de búsquedas/sueños asociados a ese número (p. ej. el 24 está caliente y suben las búsquedas de "soñar con fuego" = 24).

## Datos duros (estadística)

- **Números calientes:** los que más se repiten en una ventana temporal (30 / 90 / 365 días).
- **Números fríos:** los que menos aparecen en esa ventana.
- **Racha inversa:** número con mayor tiempo acumulado **sin** salir en los sorteos oficiales (mayor "sequía").
- **Par / impar y cuadrantes:** análisis estructural de la proporción de pares vs impares y de la distribución por cuadrantes numéricos.
- **Ventana temporal:** rango de días sobre el que se calcula una métrica (30, 90 o 365).

## Imaginario popular

- **Guía de los sueños (diccionario onírico):** mapeo tradicional hondureño de símbolos a números (p. ej. "fuego" = 24, "dinero" = 08). Alimenta el patrón `numerologia_suenos`.
- **Tendencias de búsqueda:** rastreo interno de qué números/términos consultan más los usuarios antes de un sorteo.

## Juegos y sorteos

- **Tipo de juego (`game_type`):** `diaria`, `pega3`, `premia2`, `super_premio`.
- **Sorteo (LotteryDraw):** resultado oficial de un juego, con número de sorteo y números ganadores. Histórico crudo en [[01_Dominio/Entidades#LotteryDraw|lottery_history]].

## Acceso y cobro

- **Suscripción híbrida:** acceso premium de **tiempo limitado** que puede pagarse por dos vías: `stripe` (en línea) o `cash_presencial` (efectivo en ventanilla). Ver [[01_Dominio/Entidades#Subscription|Subscription]].
- **Suscripción activa y vigente:** `isActive = true` **y** `endDate` en el futuro. Es la condición exacta para acceder a meta-patrones.
- **Cobro presencial:** registro de un pago en efectivo hecho en ventanilla por un admin/clerk; deja rastro de auditoría (admin que lo registró + número de recibo correlativo).
- **Recibo correlativo:** número de recibo físico (`receiptNumber`) que respalda un cobro presencial.

## Roles

- **Cliente (`customer`):** usuario final que consulta patrones y puede suscribirse.
- **Administrador (`admin`):** gestiona el sistema y puede registrar cobros presenciales.
- **Clerk:** empleado de ventanilla; su función principal es **registrar cobros presenciales** (cobra efectivo y emite recibo).

## Historial de cambios
- 2026-06-20: creación inicial (adopción del framework).
