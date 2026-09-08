---
obligation: standard
area: documentation
applies_to: all projects
---

# Registro de Actividad (`docs/07_Implementacion/`)

## Propósito

Llevar, con el mínimo esfuerzo posible, el estado de lo que se construye: **META**, **TAREA**, **ESTADO**, **FECHA_INI** y **FECHA_FIN**. Es la memoria mínima que permite a otro agente (o al mismo, tras un descanso) retomar el trabajo sin empezar de cero.

Es una **tabla ligera**, no una máquina de estados: suficiente para saber dónde estamos, sin burocracia.

## Dónde vive

```
docs/07_Implementacion/
├── ACTIVIDAD.md                 ← la tabla (la escribe el activity-manager)
└── _archivo/                    ← metas cerradas
```

Si el proyecto no la tiene, créala con la tabla de abajo al arrancar ([`Project_Start.md`](Project_Start.md)).

## La tabla (formato canónico)

| META | TAREA | ESTADO | FECHA_INI | FECHA_FIN |
|---|---|---|---|---|
| M-001 Autenticación | T-001 Login | EN_CURSO | 2026-08-15 | — |
| M-001 Autenticación | T-002 Refresh token | PENDIENTE | — | — |
| M-001 Autenticación | T-003 Logout | HECHA | 2026-08-15 | 2026-08-15 |

## Estados permitidos (vocabulario cerrado)

| Estado | Significa |
|---|---|
| `PENDIENTE` | Especificada, sin empezar |
| `EN_CURSO` | Alguien está trabajando en ella |
| `HECHA` | Código + tests verdes y documentado |
| `BLOQUEADA` | No puede avanzar por dependencia externa |

> Fechas en formato `YYYY-MM-DD`. `FECHA_INI` se rellena al pasar a `EN_CURSO`; `FECHA_FIN` al pasar a `HECHA`.

## Reglas

1. **Una fila por tarea.** La `META` agrupa tareas; el `ESTADO` es el estado actual.
2. **El `activity-manager` la mantiene** ([`Subagents.md`](Subagents.md)); si no hay subagentes, la mantiene quien ejecuta la tarea.
3. **No se eliminan filas.** Si una tarea deja de ser válida, se marca `BLOQUEADA` o se traslada a `_archivo/` con nota. El registro es **append-only** en sentido de auditoría: no se borra historia.
4. **Se actualiza al terminar, no al empezar**: cambia `ESTADO` y rellena la fecha correspondiente.
5. **No registres datos sensibles** (secretos, datos personales) en la tabla.

## Mini-bitácora (opcional)

Si quieres más contexto que el que da la tabla, añade un bloque `Bitácora` al pie:

```markdown
## Bitácora
- 2026-08-15 | dev-backend | T-001: implementado login; 14 tests escritos
- 2026-08-15 | tester | T-001: suite verde (14/14)
```

Línea por evento, fecha primero, autor/rol después. Append-only.

## Anti-patrones

- ❌ Crear una tarea sin su fila en la tabla.
- ❌ Dejar la tarea en `EN_CURSO` al abandonarla.
- ❌ Borrar filas para "limpiar".
- ❌ Fechas en formato libre (usa `YYYY-MM-DD`).

## Relacionado

- [`Subagents.md`](Subagents.md) — el `activity-manager`.
- [`Project_Start.md`](Project_Start.md) — cómo se crean META/TAREA al arrancar.
- [`Forbidden_Actions.md`](Forbidden_Actions.md) — regla 6: documentar lo que cambiaste.
