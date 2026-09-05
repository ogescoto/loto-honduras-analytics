# Tablero de Implementación

> **Solo el Project Manager escribe este archivo** (`/board`). Todos los demás lo leen.
> Se regenera completo en cada pasada; no se edita a mano.

**Actualizado:** `<YYYY-MM-DDTHH:MM:SSZ>`

## Estado global

| meta | titulo | estado | tareas | sub_estado_critico | iteraciones_max | sin_mapear | ultimo_evento | alerta |
|---|---|---|---|---|---|---|---|---|
| [M-001](M-001_<nombre>/META.md) | <título> | `ACTIVA` | 3/7 | `TEST_FAILED` | 4 | 2 | <ts> | T-002: 4 iteraciones |

> Estados de meta: `PLANIFICANDO` · `ACTIVA` · `EN_VALIDACION` · `VALIDADA` · `CERRADA` · `BLOQUEADA`.
> Una meta en `VALIDADA` **espera aprobación del usuario** — señálalo como acción pendiente.

## Alertas activas

*Toda alerta cita la tarea y el timestamp que la origina. Sin dato, no hay alerta.*

| tipo | meta | tarea | detalle | desde |
|---|---|---|---|---|
| Ciclo excesivo | M-001 | T-002 | 4 iteraciones (umbral 3) | <ts> |
| Estancamiento | — | — | — | — |
| Deuda de mapeo | — | — | — | — |
| Bloqueo sin dueño | — | — | — | — |
| Dependencia rota | — | — | — | — |

## Mapa de estado

```mermaid
graph TD
  subgraph M001["M-001 · Flujo de pagos"]
    T001["T-001 pantalla<br/>MAPPED"]
    T002["T-002 servicio<br/>TEST_FAILED · it.4"]
    T003["T-003 e2e<br/>PENDING"]
    T001 --> T002 --> T003
  end

  classDef pending fill:#e8e8e8,stroke:#888,color:#222
  classDef wip     fill:#cfe3ff,stroke:#3b6fb6,color:#0b2b52
  classDef failed  fill:#ffd6d6,stroke:#c04141,color:#5a1414
  classDef passed  fill:#d6f5d6,stroke:#3f9142,color:#123d16
  classDef done    fill:#e0d6f5,stroke:#7a5cc0,color:#2c1a52

  class T003 pending
  class T002 failed
  class T001 passed
```

## Línea de tiempo

```mermaid
gantt
  title Actividad por tarea
  dateFormat YYYY-MM-DDTHH:mm:ss
  axisFormat %H:%M

  section T-001
  dev (opencode)          :2026-08-07T14:30:00, 45m
  test-runner (claude)    :2026-08-07T15:15:00, 10m
  mapper (claude)         :2026-08-07T15:25:00, 15m

  section T-002
  dev (opencode)          :2026-08-07T15:52:10, 28m
  test-runner (claude)    :2026-08-07T16:20:47, 8m
  debugger (whale)        :2026-08-07T16:28:00, 20m
```

## Iteraciones por tarea

| tarea | iteraciones | umbral | estado |
|---|---|---|---|
| T-001 | 1 | 3 | OK |
| T-002 | 4 | 3 | ⚠️ excede |

## Cambios desde la última pasada

- <qué se movió, con timestamps>
