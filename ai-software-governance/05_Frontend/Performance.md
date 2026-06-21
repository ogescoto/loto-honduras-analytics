---
obligation: standard
area: frontend
applies_to: all projects
---

# Rendimiento Frontend

## Propósito
Que la aplicación sea rápida y perceptiblemente fluida. El rendimiento es parte de la experiencia, no un lujo.

## Objetivos: Core Web Vitals
Metas por defecto (móvil, percentil 75):

| Métrica | Bueno |
|---|---|
| **LCP** (Largest Contentful Paint) | < 2.5 s |
| **INP** (Interaction to Next Paint) | < 200 ms |
| **CLS** (Cumulative Layout Shift) | < 0.1 |

Medir con Lighthouse / Web Vitals en CI y en producción (RUM).

## Estrategias

### Carga
- **Code splitting** por ruta; carga diferida (`lazy`) de lo no crítico.
- **Tree shaking**: importa solo lo que usas; evita librerías pesadas para tareas triviales.
- Presupuesto de bundle (budget) vigilado en CI; alerta si crece.

### Renderizado
- Elige la estrategia correcta por página: SSR, SSG/ISR, CSR. (En Next.js, App Router por defecto; considera Server Components y Cache Components.)
- Evita renders innecesarios: memoiza componentes/cálculos costosos (`memo`, `useMemo`, `useCallback`) **con criterio**, no por reflejo.
- Listas largas: virtualización.

### Imágenes y fuentes
- Imágenes optimizadas (formatos modernos, `srcset`, lazy loading, dimensiones explícitas para evitar CLS). Usa el componente de imagen del framework.
- Fuentes: `font-display: swap`, subsetting, precarga de las críticas.

### Red y datos
- Caché de datos (server state) con invalidación; evita refetch innecesario.
- Prefetch de rutas/datos probables.
- Comprime (gzip/brotli); usa CDN para estáticos.

### Percepción
- Skeletons en vez de spinners cuando se pueda.
- Optimistic updates en mutaciones rápidas.
- Reserva espacio para contenido asíncrono (evita saltos → CLS).

## Reglas para el agente
- No introduzcas una dependencia pesada sin justificar el coste en bundle.
- Mide antes de optimizar; no microoptimices sin evidencia.
- Toda imagen nueva pasa por el pipeline de optimización del proyecto.
- Componentes con listas potencialmente grandes → considera virtualización desde el inicio.

## Verificación
- Lighthouse CI como gate (umbral configurable).
- Análisis de bundle (`webpack-bundle-analyzer` o equivalente) en revisiones de tamaño.
- Monitorización RUM en producción.

## Anti-patrones
- ❌ Cargar todo en el bundle inicial.
- ❌ Importar una librería de 200 KB para formatear una fecha.
- ❌ Imágenes sin dimensiones (provocan CLS).
- ❌ Memoizar todo "por si acaso" (añade complejidad sin medir).
- ❌ Refetch en cada render por keys de caché inestables.

## Relacionado
- [`Component_Architecture.md`](Component_Architecture.md), [`State_Management.md`](State_Management.md)
