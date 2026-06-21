---
tipo: modulo
modulo: patrones
estado: activo
actualizado: 2026-06-20
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
- Código: `apps/backend-hono/src/routes/patterns.ts`, `apps/backend-hono/src/routes/premium.ts`.

## Entidades principales
- [[01_Dominio/Entidades#GamePattern|GamePattern]] — tipos `frio_caliente`, `numerologia_suenos`, `par_impar`, `rachas_inversas`.
- [[01_Dominio/Entidades#MetaPattern|MetaPattern]] — cruza varios GamePattern (`parentPatternIds`).

## Decisiones técnicas relevantes
- [[02_Arquitectura/adr/0002-arquitectura-edge-cloudflare|ADR-0002]]: cómputo y servido en el edge.

## Flujos relacionados
- [[05_Procesos/Flujo_Acceso_Premium|Acceso a meta-patrones premium]].
- Los datos base provienen de [[05_Procesos/Flujo_Ingestion_Scraping|la ingestión de sorteos]].

## Datos y seeds
- Dependen del histórico `lottery_history`. Aún no hay seeds específicos de patrones.

## Protección
- Estado en `.aicodeprotect.yml`: **no protegido** (las rutas de patrones en sí). El acceso premium se apoya en el middleware 🔒 protegido `require-active-subscription` (ver [[04_Modulos/Suscripciones|Suscripciones]]).

## Pendiente / no documentado
- El **cálculo** real de patrones (ventanas 30/90/365, rachas, cruces psico-estadísticos) y la **captura de tendencias de búsqueda** no están implementados en el andamiaje; falta definir dónde residirá ese motor.

## Historial de cambios
- 2026-06-20: creación inicial.
