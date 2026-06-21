---
tipo: modulo
modulo: frontend
estado: andamiaje
actualizado: 2026-06-20
---

# Módulo: Frontend (Astro)

[[00_MAPA_DE_CONTENIDOS|Mapa de Contenidos]]

## Responsabilidad
Interfaz móvil-first que presenta patrones de nivel 1 (público), el área premium de meta-patrones y la pantalla de administración de cobros presenciales. Astro SSR en Cloudflare Pages.

## Lenguaje ubicuo
- Reusa el [[01_Dominio/Glosario|Glosario]] del dominio.

## Dependencias
- [[02_Arquitectura/API|API del backend]] (consumo HTTP exclusivo).
- `packages/shared-types` (tipos de dominio y respuestas).
- Tailwind CSS + shadcn/ui.

## API pública
- No expone API; consume la del backend. Páginas en `apps/frontend-astro/src/pages/`.

## Vistas
- Ver el [[06_UX_UI/Mapa_Navegacion|Mapa de navegación]]: Landing, Dashboard, zona Premium, Admin (cobros).

## Decisiones técnicas relevantes
- [[02_Arquitectura/adr/0002-arquitectura-edge-cloudflare|ADR-0002]]: Astro SSR en el edge para HTML ligero en redes móviles.

## Flujos relacionados
- [[05_Procesos/Flujo_Acceso_Premium|Acceso premium]], [[05_Procesos/Flujo_Cobro_Presencial|Cobro presencial]].

## Protección
- Estado en `.aicodeprotect.yml`: **no protegido**.

## Pendiente / no documentado
- **Andamiaje:** solo existe `index.astro` con una landing mínima. Faltan Dashboard, área premium, pantalla de Admin, componentes shadcn/ui y la integración real con la API. Tests E2E con Playwright (`tests/e2e/landing.spec.ts`).

## Historial de cambios
- 2026-06-20: creación inicial (estado andamiaje).
