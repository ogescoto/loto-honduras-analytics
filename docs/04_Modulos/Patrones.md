---
tipo: modulo
modulo: patrones
estado: activo
actualizado: 2026-09-05
---

# Módulo: Patrones

[[00_MAPA_DE_CONTENIDOS|Mapa de Contenidos]]

## Responsabilidad
Servir los patrones analíticos de la plataforma en dos niveles: **nivel 1** (datos duros + imaginario popular, freemium) y **meta-patrones** de nivel 2 (psico-estadísticos, premium).

## Lenguaje ubicuo
- **Patrón nivel 1, meta-patrón, fríos/calientes, racha inversa, guía de los sueños:** ver [[01_Dominio/Glosario|Glosario]].

## Dependencias
- [[04_Modulos/Suscripciones|Suscripciones]] (para el acceso a meta-patrones).
- `packages/shared-types` (tipos `GamePattern`, `MetaPattern`, `PatternType`).
- Neon / Postgres vía Drizzle.

## API pública
- **Consultas:** `GET /api/v1/patterns` (nivel 1), `GET /api/v1/premium/meta-patterns` (nivel 2). Ver [[02_Arquitectura/API|API]].
- **Motor interactivo (pantalla de análisis y Estudio Premium):** `POST /api/v1/features/:game/filter` (candidatos por combinación de características) y `POST /api/v1/features/:game/hits` (historial de aciertos + **efectividad**). `GET /api/v1/features/:game` (estado de los 100 números) y `GET /api/v1/features/catalog` (catálogo de las 25 características).
- `/hits` acepta `days` (1-90) para **emular por ventana** y devuelve `totalHits`, `evaluatedDraws` y `hitRatePct` (cuántos sorteos habría acertado la combinación). `compliance.ts`: `complianceSummary()` expone el resumen; `computeWinnerCompliance`/`lastHits` se mantienen como compat.
- Código de rutas: `apps/backend-hono/src/routes/patterns.ts`, `apps/backend-hono/src/routes/premium.ts`, `apps/backend-hono/src/routes/features.ts` y `apps/backend-hono/src/patterns/compliance.ts` (evaluación optimizada de aciertos por sorteo, sin recomputar los 100 números por jugada — evita el límite de CPU del Worker).

## Pantalla de análisis (`/patrones`)
Rediseñada (2026-09-05) con 4 tabs internos y datos cargados client-side:
1. **🎯 Candidatos** — combina hasta 7 de los 25 patrones; llama a `/filter` y muestra los números que cumplen todos (o la mejor aproximación). Incluye el **constructor personal**: chips arrastrables (reordenan la combinación) y guardado/carga/borrado de combinaciones vía `/saved-patterns` (`user_saved_patterns`).
2. **📜 Historial** — llama a `/hits` y muestra, ordenado del más reciente al más antiguo, los sorteos del juego donde el ganador cumplía toda la combinación (con "hace ~N días").
3. **📚 Guía** — catálogo completo de los 25 patrones con su descripción.
4. **⭐ Guardados** — favoritos del usuario (localStorage + API `/favorites` cuando hay sesión).
Deslogueado muestra CTA que enlaza a `/login` y `/premium#planes`. Script procesado (no `is:inline` + `define:vars`); estado inicial vía `data-*` y la base de API resuelta en build-time.

## Estudio Premium (`/premium`, suscriptores)
Página `premium.astro` rediseñada (2026-09-05): la funcionalidad premium ya no son tarjetas estáticas, sino un **Estudio de Combinaciones**:
- **Constructor**: elige hasta 7 de los 25 patrones con chips ordenables (drag & drop) y guarda combinaciones en la cuenta (`/api/v1/saved-patterns`).
- **Evaluar selección / todas**: para cada combinación llama a `/filter` (candidatos del próximo sorteo) y `/hits` (historial) y muestra la **efectividad** `hitRatePct` (aciertos/`evaluatedDraws`), los sorteos acertados y la lista cronológica con "hace ~N días".
- **Emulación**: selector de ventana (7/15/30/60/90 días) que re-evalúa la combinación (parámetro `days` de `/hits`).
- **Comparativa**: "Evaluar todas" ordena las combinaciones por efectividad en una tabla.
- Los **meta-patrones psico-estadísticos** pasan a una sección secundaria bajo el estudio.

## Motor de patrones
Lógica de cálculo en `apps/backend-hono/src/patterns/`:
- **`engine.ts`** (lógica pura, sin I/O — testeable): `withinWindow` (filtra por ventana de N días), `frequency` (conteo de apariciones), `hotCold` (top calientes/fríos por ventana), `inverseStreaks` (rachas inversas: números más "atrasados"), `parity` (distribución par/impar), `crossMetaPatterns` (cruce psico-estadístico: calientes ∩ números de sueños/búsquedas en tendencia, con `confidenceScore`).
- **`dream-guide.ts`**: `DREAM_GUIDE` (guía de los sueños hondureña: `fuego=24`, `dinero=8`, `agua=12`, …) y `numberForDream(symbol)`.
- **`compute.ts`**: `computePatternsForGame(db, game, dreamNumbers, now)` — calcula patrones nivel 1 en ventanas **30/90/365** días (`frio_caliente` por ventana, `rachas_inversas`, `par_impar`) y meta-patrones (cruce de calientes de 30 d con `dreamNumbers`), y los **persiste** en `game_patterns` y `meta_patterns`. Dominio numérico `00–99`.
- **Numerología por defecto (2026-09-05):** si se invoca sin `dreamNumbers`, usa `Object.values(DREAM_GUIDE)` como referencia del imaginario popular, de modo que el cruce `calientes ∩ sueños` siempre pueda generar meta-patrones. Antes, `ingest.ts` llamaba con `[]` → `meta_patterns` quedaba vacío (la pantalla premium parecía "vacía"). Tras `seed:prod` hay **65 patrones + 32 meta-patrones**.
- Se recalcula en background tras cada ingestión (`ingest.ts` → `ctx.waitUntil(computePatternsForGame(...))`).

## Entidades principales
- [[01_Dominio/Entidades#GamePattern|GamePattern]] — tipos `frio_caliente`, `numerologia_suenos`, `par_impar`, `rachas_inversas`.
- [[01_Dominio/Entidades#MetaPattern|MetaPattern]] — cruza varios GamePattern (`parentPatternIds`).

## Decisiones técnicas relevantes
- [[02_Arquitectura/adr/0002-arquitectura-edge-cloudflare|ADR-0002]]: cómputo y servido en el edge.

## Flujos relacionados
- [[05_Procesos/Flujo_Acceso_Premium|Acceso a meta-patrones premium]].
- Los datos base provienen de [[05_Procesos/Flujo_Ingestion_Scraping|la ingestión de sorteos]].

## Datos y seeds
- Dependen del histórico `lottery_history`. Aún no hay seeds específicos de patrones (se generan al ejecutar el motor).

## Protección
- Estado en `.aicodeprotect.yml`: **no protegido** (las rutas y el motor de patrones en sí). El acceso premium se apoya en el middleware 🔒 protegido `require-active-subscription` (ver [[04_Modulos/Suscripciones|Suscripciones]]).

## Pendiente / no documentado
- La **captura automática de tendencias de búsqueda/sueños** (origen de `dreamNumbers`) aún no tiene fuente conectada; hoy se usa la guía fija `DREAM_GUIDE` como numerología por defecto.
- Falta el **disparador programado** independiente que ejecute `computePatternsForGame` periódicamente (hoy se recalcula en background tras cada ingestión).

## Historial de cambios
- 2026-09-05: **Estudio Premium** funcional — `/hits` con `days`/`days` y `hitRatePct`, `complianceSummary()`, y estación de combinaciones en `/premium` con emulación y comparativa.
- 2026-09-05: **constructor personal** en `/patrones` — chips arrastrables y combinaciones guardadas por usuario (`user_saved_patterns`, migración `0006`); el clic en resultados guarda el favorito en la cuenta. `computePatternsForGame` usa `DREAM_GUIDE` como numerología por defecto → premium con 32 meta-patrones.
- 2026-09-05: rediseñada la pantalla `/patrones` (tabs Candidatos/Historial/Guía/Guardados) y documentado el motor interactivo (catalog, filter, hits con `compliance.ts`).
- 2026-06-21: documentado el motor de patrones implementado (`engine.ts`, `dream-guide.ts`, `compute.ts`): ventanas 30/90/365, rachas inversas, par/impar y meta-patrones psico-estadísticos persistidos. Resuelto el pendiente de cálculo.
- 2026-06-20: creación inicial.
