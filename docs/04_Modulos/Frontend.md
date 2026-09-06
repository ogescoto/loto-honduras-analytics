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
- **Páginas** en `src/pages/`: `index.astro` (Dashboard, patrones nivel 1 públicos), `premium.astro` (**Estudio Premium** para suscriptores: constructor en dos paneles "Patrones disponibles/Seleccionados", tab "Mis combinaciones" con atrás/adelante, efectividad, emulación y comparativa; sin suscripción muestra preview + planes también deslogueado), `patrones.astro` (Análisis de patrones: 4 tabs Candidatos/Historial/Guía/Guardados + **constructor de combinaciones**), `favoritos.astro` (Mis favoritos, reordenables por drag & drop con persistencia en cuenta), `configuracion.astro` (solo admin/clerk — **configuración de patrones**: lista los actuales, editor JSON con validar/probar/descargar), `history.astro` (búsqueda por número con filtro de juego y período hasta 90 días), `login.astro` / `register.astro` / `forgot-password.astro` / `reset-password.astro`, `admin.astro` (suscripciones, usuarios con cambio de rol y asignación de plan, cobro presencial) y `admin/` (`resultados.astro` alza manual, `fuentes.astro` CRUD de fuentes, `logs.astro` eventos de ingestión).

## MCP patrones (admin)
`mcp/loto-pattern-tools/` es un **servidor MCP** (stdio, sin dependencias) registrado en `opencode.json` que expone `list_patterns`, `get_config`, `validate_config`, `test_combo` y `candidates` para que el **admin** configure nuevas combinaciones y las evalúe contra la API sin tocar la UI. Ver su `README.md`. El JSON interpretable proviene de `GET /api/v1/features/config`.

## Favoritos y constructor de patrones
- **`/favoritos`** (`src/pages/favoritos.astro`): lista de `UserFavorite` con **drag & drop** (HTML5) para reordenar + fallback táctil (▲/▼), persistido vía `PATCH /api/v1/favorites/reorder`; botón "Ver historia" abre la búsqueda del número en `/history`. Accesible desde el nav y el menú móvil.
- **Constructor en `/patrones`**: chips ordenables de los patrones seleccionados (drag & drop) cuya **sección "Mis combinaciones guardadas"** permite guardar/cargar/eliminar combinaciones vía `/api/v1/saved-patterns`. El clic en un número de resultados guarda el favorito en la cuenta (si hay sesión) además de localStorage.

## Nota sobre scripts Astro
`define:vars` implica `is:inline` (sin procesar). En páginas con lógica de cliente compleja (`patrones.astro`, `admin.astro`) se prefiere un `<script>` procesado que resuelve `import.meta.env` en build-time y recibe estado inicial vía atributos `data-*`, evitando la combinación `is:inline` + `define:vars` que impedía resolver la base de API en el navegador.

## Navegación mixta móvil / desktop (2026-09-05)
`src/layouts/Shell.astro` implementa **dos patrones de navegación** según el dispositivo:
- **Desktop (≥ `md`):** barra superior con nav horizontal (Dashboard · Historial · Análisis · Premium · Admin) + hamburguesa oculta.
- **Móvil (< `md`):** **barra inferior fija** (`fixed bottom-0`, `md:hidden`) con las 4 rutas principales — Inicio · Historial · Análisis · Premium — con iconos SVG, `aria-current` para la activa y `padding-bottom: env(safe-area-inset-bottom)` para notches. La **hamburguesa superior** queda solo para enlaces secundarios (Admin si aplica, Salir/Entrar) y se cierra al navegar.
- El `<main>` lleva `pb-24 md:pb-6` para que el contenido no quede tapado por la barra inferior.
- **Pestañas/píldoras scrollables:** en `/patrones` los 4 tabs pasan a **scroll horizontal con snap** en móvil (en línea en desktop); en las páginas de admin las píldoras de navegación usan la utilidad `.nav-pills` de `src/styles/global.css` (horizontal-scroll en móvil, wrap en desktop) + scrollbar delgada `.scrollbar-thin`.

## Zona horaria (GMT-6)
Todas las fechas de sorteos se muestran en **hora de Honduras** (`America/Tegucigalpa`, GMT-6): en `patrones.astro` los aciertos del historial se formatean con `timeZone: America/Tegucigalpa` y el "hace N días" se calcula contra el día civil HN (el marcador canónico `10:00Z`); en `history.astro` el día se preserva parseando solo `YYYY-MM-DD`. Ver la convención en [[04_Modulos/Scraper_Ingestion|Ingestión]].

## Tareas programadas (visibilidad)
`admin/logs.astro` incluye una sección **"Tareas programadas (cron)"** que describe los 3 disparos del Worker `loto-scraper-cron` (11:15 / 15:15 / 21:15 HN, crons UTC `15 17/21/3 * * *`), los juegos de cada franja y la **última corrida** detectada a partir de los eventos de ingestión.

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
- 2026-09-05: `/premium` con **constructor en dos paneles** (disponibles/seleccionados) y tab **"Mis combinaciones"** con atrás/adelante; nueva `/configuracion` (editor JSON de patrones) y **MCP** `loto-pattern-tools`.
- 2026-09-05: `/premium` rediseñada como **Estudio Premium** funcional (combinaciones, efectividad, emulación, comparativa); los planes siguen visibles sin sesión.
- 2026-09-05: añadidas **`/favoritos`** (drag & drop reordenable) y el **constructor de combinaciones** en `/patrones` (chips arrastrables + guardado en cuenta); buscador móvil accesible y período hasta 90 días en `/history`.
- 2026-09-05: **navegación mixta** — barra inferior móvil (4 rutas), hamburguesa solo secundaria, tabs de `/patrones` y píldoras admin a scroll horizontal en móvil (`.nav-pills`, safe-area).
- 2026-09-05: fechas de sorteos en **GMT-6** (`America/Tegucigalpa`) en `patrones.astro`; sección **Tareas programadas** en `admin/logs.astro` con última corrida por franja.
- 2026-09-05: rediseñadas `patrones.astro` (tabs de análisis), `premium.astro` (planes visibles deslogueado) y `admin.astro` (cambio de rol y asignación de planes); nota sobre scripts Astro (`define:vars` = inline).
- 2026-09-05: añadidas páginas `history.astro` (filtro de juego), `patrones.astro` (patrones automáticos públicos), auth (login/register/reset) y admin (`resultados`, `fuentes`, `logs`). Actualizada la estructura de páginas.
- 2026-06-21: documentadas las páginas reales (Dashboard, Premium, Admin), el `Shell.astro`, el componente `NumberBalls.astro`, el cliente `src/lib/api.ts` y Tailwind. Estado pasa a activo; resuelto el pendiente de andamiaje.
- 2026-06-20: creación inicial (estado andamiaje).
