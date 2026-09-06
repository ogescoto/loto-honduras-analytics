# M-<NNN> — Índice de tareas

> Vista de estado de la meta. La regenera el **Project Manager** (`/board`); los agentes la
> **leen** para saber si hay una tarea cuyo `siguiente_rol` les corresponde.

**Meta:** [`META.md`](META.md) · **Actualizado:** `<YYYY-MM-DDTHH:MM:SSZ>`

## Tareas

| tarea | titulo | tipo | sub_estado | iteracion | depende_de | siguiente_rol | actualizado |
|---|---|---|---|---|---|---|---|
| [T-001](T-001_<nombre>.md) | <título> | pantalla | `PENDING` | 0 | — | `dev` | <ts> |
| [T-002](T-002_<nombre>.md) | <título> | servicio | `TEST_FAILED` | 2 | T-001 | `debugger` | <ts> |

## Estado de la meta

```mermaid
graph LR
  T001["T-001 pantalla<br/>PENDING"]
  T002["T-002 servicio<br/>TEST_FAILED"]
  T003["T-003 e2e<br/>PENDING"]

  T001 --> T002 --> T003

  classDef pending fill:#e8e8e8,stroke:#888,color:#222
  classDef wip     fill:#cfe3ff,stroke:#3b6fb6,color:#0b2b52
  classDef failed  fill:#ffd6d6,stroke:#c04141,color:#5a1414
  classDef passed  fill:#d6f5d6,stroke:#3f9142,color:#123d16
  classDef done    fill:#e0d6f5,stroke:#7a5cc0,color:#2c1a52

  class T001,T003 pending
  class T002 failed
```

> Colores por sub-estado: gris `PENDING` · azul en curso (`CODING`, `TESTING`,
> `DEBUG_ANALYSIS`) · rojo `TEST_FAILED`/`FIX_REQUIRED` · verde `TEST_PASSED`/`MAPPED` ·
> morado `COMPLETE`.

## Deuda de mapeo

*Tareas en `TEST_PASSED` o `COMPLETE` que nunca pasaron por `MAPPED`.*

| tarea | sub_estado | cerrada desde |
|---|---|---|
| — | — | — |

## Bitácoras diarias

Ver [`_log/`](_log/) — un archivo por día con todos los eventos de la meta.
