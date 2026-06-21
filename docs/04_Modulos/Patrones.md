---
tipo: modulo
modulo: patrones
estado: activo
actualizado: 2026-06-21
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
- Código de rutas: `apps/backend-hono/src/routes/patterns.ts`, `apps/backend-hono/src/routes/premium.ts`.

## Motor de patrones
Lógica de cálculo en `apps/backend-hono/src/patterns/`:
- **`engine.ts`** (lógica pura, sin I/O — testeable): `withinWindow` (filtra por ventana de N días), `frequency` (conteo de apariciones), `hotCold` (top calientes/fríos por ventana), `inverseStreaks` (rachas inversas: números más "atrasados"), `parity` (distribución par/impar), `crossMetaPatterns` (cruce psico-estadístico: calientes ∩ números de sueños/búsquedas en tendencia, con `confidenceScore`).
- **`dream-guide.ts`**: `DREAM_GUIDE` (guía de los sueños hondureña: `fuego=24`, `dinero=8`, `agua=12`, …) y `numberForDream(symbol)`.
- **`compute.ts`**: `computePatternsForGame(db, game, dreamNumbers, now)` — calcula patrones nivel 1 en ventanas **30/90/365** días (`frio_caliente` por ventana, `rachas_inversas`, `par_impar`) y meta-patrones (cruce de calientes de 30 d con `dreamNumbers`), y los **persiste** en `game_patterns` y `meta_patterns`. Dominio numérico `00–99`.

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
- La **captura automática de tendencias de búsqueda/sueños** (origen de `dreamNumbers`) aún no tiene fuente conectada; hoy se pasan como entrada al motor.
- Falta el **disparador programado** que ejecute `computePatternsForGame` periódicamente (p. ej. tras la ingestión).

## Historial de cambios
- 2026-06-21: documentado el motor de patrones implementado (`engine.ts`, `dream-guide.ts`, `compute.ts`): ventanas 30/90/365, rachas inversas, par/impar y meta-patrones psico-estadísticos persistidos. Resuelto el pendiente de cálculo.
- 2026-06-20: creación inicial.
