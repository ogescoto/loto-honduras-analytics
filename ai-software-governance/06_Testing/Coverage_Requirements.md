---
obligation: standard
area: testing
applies_to: all projects
---

# Requisitos de Cobertura

## Propósito
Fijar un mínimo de cobertura que dé confianza, sin caer en la trampa de perseguir el 100% a ciegas.

## Filosofía
La cobertura es un **indicador**, no un objetivo en sí. Un 90% de cobertura con aserciones débiles vale menos que un 70% bien pensado. Aun así, fijamos mínimos para evitar regresiones de calidad.

## Umbrales por defecto

| Ámbito | Cobertura mínima |
|---|---|
| Lógica de dominio (`domain/`) | **90%** |
| Casos de uso (`application/`) | **85%** |
| Proyecto global | **80%** |
| Código nuevo en un PR (diff coverage) | **85%** |

> Cada proyecto puede ajustar estos umbrales en su documentación, pero **no por debajo del 70% global** sin un ADR que lo justifique.

## Qué priorizar
- **Sí, intensamente:** reglas de negocio, casos límite, ramas de error, invariantes del dominio.
- **Con criterio:** integraciones y flujos críticos.
- **No obsesionarse:** getters/setters triviales, código generado, configuración.

## Qué NO cuenta como bien cubierto
- Tests sin aserciones reales.
- Tests que solo ejecutan código sin verificar resultados.
- Aumentar cobertura escribiendo tests que nunca pueden fallar.

## Gate en CI
- La cobertura se mide en cada PR.
- **Diff coverage** (cobertura del código cambiado) es el gate más útil: el código nuevo debe estar probado.
- Bajar la cobertura global por debajo del umbral **bloquea el merge**.

```yaml
# Ejemplo conceptual de gate (adaptar a la herramienta del stack)
coverage:
  global_minimum: 80
  diff_minimum: 85
  fail_under: true
```

## Reglas para el agente
- Al añadir lógica, añade tests que cubran el camino feliz **y** los errores/casos límite.
- Si bajas la cobertura, justifícalo en el PR o añade tests.
- No "rellenes" cobertura con tests vacíos para pasar el gate.

## Anti-patrones
- ❌ Tests sin `expect`/`assert` solo para subir el número.
- ❌ Perseguir 100% ignorando la calidad de las aserciones.
- ❌ Excluir del cómputo el código difícil de probar para maquillar la métrica.
- ❌ Mergear código nuevo sin tests "porque el global ya está alto".

## Relacionado
- [`Testing_Strategy.md`](Testing_Strategy.md), [`E2E_Standards.md`](E2E_Standards.md), [`../08_DevOps/CI_CD.md`](../08_DevOps/CI_CD.md)
