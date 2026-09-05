---
tipo: ux-ui
estado: activo
actualizado: 2026-09-05
---

# Mapa de navegación

[[00_MAPA_DE_CONTENIDOS|Mapa de Contenidos]]

Vistas del [[04_Modulos/Frontend|frontend Astro]] (móvil-first), montadas sobre el **Shell** (`src/layouts/Shell.astro`, shell PWA con navegación).

## Vistas (páginas reales)
- **Dashboard** (`src/pages/index.astro`): patrones de nivel 1 públicos (fríos/calientes, rachas inversas, par/impar, numerología de sueños). Usa el componente `NumberBalls.astro`. Acceso público/freemium.
- **Zona Premium** (`src/pages/premium.astro`): meta-patrones de nivel 2; **gate por token de suscriptor** (Bearer JWT); si no hay acceso, invita a suscribirse. Los planes (1/3/6/12 meses) se muestran también deslogueado para que el enlace `#planes` funcione desde el gate de `/patrones`. Ver [[05_Procesos/Flujo_Acceso_Premium|flujo premium]] y [[05_Procesos/Flujo_Pago_Online|pago online]].
- **Análisis de patrones** (`src/pages/patrones.astro`): 4 tabs (**Candidatos** para el próximo sorteo, **Historial** de aciertos con días atrás, **Guía** de los 25 patrones y **Guardados**). Requiere sesión; sin sesión muestra gate con CTA a `/login` y `/premium#planes`. Ver [[04_Modulos/Patrones|Patrones]].
- **Admin** (`src/pages/admin.astro`): gestión de usuarios (cambio de rol y asignación de plan), listado de suscripciones y formulario de registro de [[05_Procesos/Flujo_Cobro_Presencial|cobro presencial]]. Acceso restringido por rol.

## Diagrama
```mermaid
graph LR
  SH[Shell · navegación PWA] --> D[Dashboard · patrones nivel 1]
  SH --> P[Zona Premium · meta-patrones]
  SH --> A[Admin · cobros presenciales]
  P -.sin token válido.-> S[Invitación a suscribirse]
```

## Reglas de acceso
- Dashboard: público.
- Zona Premium: requiere suscripción vigente (gate por token; ver [[05_Procesos/Flujo_Acceso_Premium|flujo premium]]).
- Admin: rol `admin`/`clerk`.

## Componentes y cliente
- **Shell:** `src/layouts/Shell.astro`. **NumberBalls:** `src/components/NumberBalls.astro`. **Cliente API:** `src/lib/api.ts`.
- Estilos con **Tailwind CSS** (`@astrojs/tailwind`).

## Pendiente
- Design system formal (tokens, componentes reutilizables) y wireframes de alta fidelidad; falta una pantalla de **login** propia.

## Historial de cambios
- 2026-09-05: añadida la vista **Análisis de patrones** (4 tabs), actualizadas Zona Premium (planes visibles deslogueado) y Admin (roles/planes por usuario).
- 2026-06-21: documentadas las 3 páginas reales (Dashboard, Premium, Admin), el Shell, `NumberBalls` y Tailwind. Estado activo; resuelto el pendiente de andamiaje.
- 2026-06-20: creación inicial.
