---
tipo: modulo
modulo: frontend
estado: activo
actualizado: 2026-06-21
---

# Módulo: Frontend (Astro)

[[00_MAPA_DE_CONTENIDOS|Mapa de Contenidos]]

## Responsabilidad
Interfaz móvil-first que presenta patrones de nivel 1 (público), el área premium de meta-patrones y la pantalla de administración de cobros presenciales. Astro SSR en Cloudflare Pages.

## Lenguaje ubicuo
- Reusa el [[01_Dominio/Glosario|Glosario]] del dominio.

## Dependencias
- [[02_Arquitectura/API|API del backend]] (consumo HTTP exclusivo vía `src/lib/api.ts`).
- `packages/shared-types` (tipos de dominio y respuestas).
- Tailwind CSS (`@astrojs/tailwind`).

## API pública
- No expone API; consume la del backend mediante `src/lib/api.ts` (`apiGet<T>(path, token?)`, base `PUBLIC_API_BASE_URL`, añade `Authorization: Bearer` si hay token y normaliza errores de red a `NETWORK_ERROR`).

## Estructura
- **Layout:** `src/layouts/Shell.astro` (shell PWA con navegación).
- **Componente:** `src/components/NumberBalls.astro` (visualización de números).
- **Páginas** en `src/pages/`: `index.astro` (Dashboard, patrones nivel 1 públicos), `premium.astro` (Zona Premium, meta-patrones con gate por token de suscriptor), `admin.astro` (registro de cobro presencial, con anti doble-click).

## Vistas
- Ver el [[06_UX_UI/Mapa_Navegacion|Mapa de navegación]]: Dashboard, Zona Premium, Admin (cobros), sobre el Shell.

## Decisiones técnicas relevantes
- [[02_Arquitectura/adr/0002-arquitectura-edge-cloudflare|ADR-0002]]: Astro SSR en el edge para HTML ligero en redes móviles.

## Flujos relacionados
- [[05_Procesos/Flujo_Acceso_Premium|Acceso premium]], [[05_Procesos/Flujo_Cobro_Presencial|Cobro presencial]].

## Protección
- Estado en `.aicodeprotect.yml`: **no protegido**.

## Pendiente / no documentado
- No hay todavía una pantalla de **login** propia ni gestión persistente del token de sesión (hoy el gate premium usa un token de suscriptor introducido manualmente).
- Tests E2E con Playwright (`tests/e2e/landing.spec.ts`); falta cobertura E2E de las páginas Premium y Admin.

## Historial de cambios
- 2026-06-21: documentadas las páginas reales (Dashboard, Premium, Admin), el `Shell.astro`, el componente `NumberBalls.astro`, el cliente `src/lib/api.ts` y Tailwind. Estado pasa a activo; resuelto el pendiente de andamiaje.
- 2026-06-20: creación inicial (estado andamiaje).
