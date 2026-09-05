---
tipo: modulo
modulo: frontend
estado: activo
actualizado: 2026-09-05
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
- **Componentes:** `src/components/` — `NumberBalls.astro`, `DrawBalls.astro`, `PatternCard.astro`, `MetaPatternCard.astro`, `ConfidenceBar.astro`, `FavoriteButton.astro`, `GameSelector.astro`, `AdBanner.astro`.
- **Páginas** en `src/pages/`: `index.astro` (Dashboard, patrones nivel 1 públicos), `premium.astro` (Zona Premium; planes visibles también sin sesión), `patrones.astro` (Análisis de patrones: 4 tabs Candidatos/Historial/Guía/Guardados), `history.astro` (búsqueda por número con filtro de juego), `login.astro` / `register.astro` / `forgot-password.astro` / `reset-password.astro`, `admin.astro` (suscripciones, usuarios con cambio de rol y asignación de plan, cobro presencial) y `admin/` (`resultados.astro` alza manual, `fuentes.astro` CRUD de fuentes, `logs.astro` eventos de ingestión).

## Nota sobre scripts Astro
`define:vars` implica `is:inline` (sin procesar). En páginas con lógica de cliente compleja (`patrones.astro`, `admin.astro`) se prefiere un `<script>` procesado que resuelve `import.meta.env` en build-time y recibe estado inicial vía atributos `data-*`, evitando la combinación `is:inline` + `define:vars` que impedía resolver la base de API en el navegador.

## Vistas
- Ver el [[06_UX_UI/Mapa_Navegacion|Mapa de navegación]]: Dashboard, Zona Premium, Admin (cobros), sobre el Shell.

## Decisiones técnicas relevantes
- [[02_Arquitectura/adr/0002-arquitectura-edge-cloudflare|ADR-0002]]: Astro SSR en el edge para HTML ligero en redes móviles.

## Flujos relacionados
- [[05_Procesos/Flujo_Acceso_Premium|Acceso premium]], [[05_Procesos/Flujo_Cobro_Presencial|Cobro presencial]].

## Protección
- Estado en `.aicodeprotect.yml`: **no protegido**.

## Pendiente / no documentado
- Tests E2E con Playwright (`tests/e2e/landing.spec.ts`); falta cobertura E2E de las páginas Premium, Admin y de búsqueda.

## Historial de cambios
- 2026-09-05: rediseñadas `patrones.astro` (tabs de análisis), `premium.astro` (planes visibles deslogueado) y `admin.astro` (cambio de rol y asignación de planes); nota sobre scripts Astro (`define:vars` = inline).
- 2026-09-05: añadidas páginas `history.astro` (filtro de juego), `patrones.astro` (patrones automáticos públicos), auth (login/register/reset) y admin (`resultados`, `fuentes`, `logs`). Actualizada la estructura de páginas.
- 2026-06-21: documentadas las páginas reales (Dashboard, Premium, Admin), el `Shell.astro`, el componente `NumberBalls.astro`, el cliente `src/lib/api.ts` y Tailwind. Estado pasa a activo; resuelto el pendiente de andamiaje.
- 2026-06-20: creación inicial (estado andamiaje).
