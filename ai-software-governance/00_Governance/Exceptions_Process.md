---
obligation: standard
area: governance
applies_to: all projects
---

# Proceso de Excepciones

## Propósito
Dar una vía formal para desviarse de una política cuando está justificado, sin convertir las reglas en papel mojado ni en una camisa de fuerza.

## Principio
Las reglas existen para el caso común. A veces el caso concreto justifica una excepción. El proceso garantiza que la excepción sea **consciente, aprobada y registrada**, no un atajo silencioso.

## Qué se puede exceptuar (según nivel)

| Nivel | ¿Excepción posible? | Cómo |
|---|---|---|
| `mandatory` | **No** por la vía normal | Solo el humano responsable asume la acción y registra un ADR; el agente nunca lo decide |
| `standard` | Sí | Aprobación + ADR |
| `guideline` | Sí | Justificación breve en el PR/nota |
| `recommendation` | Sí | Libre, sin trámite |

## Flujo para excepciones a `standard`

```
1. Detectar el conflicto entre la tarea y la política.
2. Documentar: qué política, por qué se necesita la excepción, alcance y duración.
3. Proponer (ADR en estado "Propuesto").
4. Aprobación del responsable (Tech Lead).
5. Registrar (ADR "Aceptado" + nota en CHANGELOG si aplica).
6. Aplicar la excepción dentro del alcance acordado.
```

## Contenido mínimo de una solicitud de excepción

```markdown
## Solicitud de excepción
- **Política afectada:** 06_Testing/Coverage_Requirements.md (cobertura diff 85%)
- **Excepción solicitada:** aceptar 70% en el módulo `legacy-import`
- **Motivo:** código heredado sin tests; refactor planificado para Q3
- **Alcance:** solo `src/legacy-import/**`
- **Duración:** hasta el refactor (ADR de seguimiento)
- **Mitigación:** tests E2E cubren el flujo crítico
> Esperando aprobación del Tech Lead.
```

## Excepciones temporales vs. permanentes
- **Temporal:** tiene fecha/condición de caducidad y un plan para volver a la norma. Recomendado por defecto.
- **Permanente:** implica que quizá la política deba cambiarse → abrir ADR para modificar la política, no acumular excepciones.

> Si una política genera excepciones repetidas, **la política está mal**: revísala vía ADR.

## Registro
- Toda excepción a `standard`/`mandatory` queda como ADR en `docs/02_Arquitectura/adr/` (proyecto) o en [`../07_Documentation/ADR.md`](../07_Documentation/ADR.md) (framework).
- El [`Policy_Index.md`](Policy_Index.md) puede enlazar excepciones vigentes relevantes.

## Rol del agente
- El agente **no se auto-concede** excepciones. Detecta el conflicto, lo expone y espera decisión humana (ver [`../09_AI/Forbidden_Actions.md`](../09_AI/Forbidden_Actions.md)).
- Tras una excepción aprobada, el agente la aplica solo dentro del alcance registrado.

## Anti-patrones
- ❌ Saltarse una regla sin registrarlo ("excepción silenciosa").
- ❌ Acumular excepciones en vez de corregir la política.
- ❌ Excepciones permanentes sin revisar la norma.
- ❌ Que el agente decida por su cuenta incumplir una `standard`/`mandatory`.

## Relacionado
- [`Policy_Index.md`](Policy_Index.md), [`../07_Documentation/ADR.md`](../07_Documentation/ADR.md), [`../GOVERNANCE.md`](../GOVERNANCE.md), [`../09_AI/Forbidden_Actions.md`](../09_AI/Forbidden_Actions.md)
