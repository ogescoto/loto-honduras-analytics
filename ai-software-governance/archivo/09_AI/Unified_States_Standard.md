---
obligation: mandatory
area: ai-governance
applies_to: all projects
---

# Estándares Unificados de Estados

## Propósito

Definir en **un solo lugar** todos los estados posibles en el ciclo de vida de un proyecto: 
- Estados de **tarea** (`sub_estado`)
- Estados de **meta** (`estado`)
- Transiciones permitidas
- Quién entra en cada uno
- Qué produce

Este documento es la **fuente canónica**. Cuando otros documentos hablen de estados, remiten aquí.

---

## 1. Estados de TAREA (`sub_estado`) — Ciclo de Desarrollo

Una tarea recorre un ciclo lineal con un punto de bifurcación en tests:

```
┌─────────────────────────────────────────────────────┐
│ PENDING                                             │
│ • Especificada, sin empezar                         │
│ • Entra: dev (primer ataque)                        │
└──────────────┬──────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────┐
│ CODING                                              │
│ • dev escribiendo código + tests unitarios          │
│ • Rol ocupado: dev-backend o dev-frontend           │
└──────────────┬──────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────┐
│ CODE_COMPLETE                                       │
│ • Código escrito + sus tests (aún sin ejecutar)     │
│ • Entra: qa-tester (ejecuta la suite)               │
└──────────────┬──────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────┐
│ TESTING                                             │
│ • qa-tester ejecutando la suite del proyecto        │
│ • Rol ocupado: qa-tester                            │
└──────────────┬──────────────────────────────────────┘
               │
        ┌──────┴───────┐
        │              │
        ▼              ▼
    ✅ PASA      ❌ FALLA
        │              │
        ▼              ▼
   TEST_PASSED   TEST_FAILED
        │              │
        │              └─────────┐
        │                        │
        │              ┌─────────▼────────────────────┐
        │              │ DEBUG_ANALYSIS              │
        │              │ • debugger investigando     │
        │              │ • Rol ocupado: debugger     │
        │              │ • Output: qué cambiar       │
        │              └─────────┬────────────────────┘
        │                        │
        │              ┌─────────▼────────────────────┐
        │              │ FIX_REQUIRED                │
        │              │ • debugger indicó cambios   │
        │              │ • Entra: dev (nuevamente)   │
        │              └──────────┬───────────────────┘
        │                         │
        │         ┌───────────────┘
        │         │
        │         ▼
        │    CODING (ciclo de nuevo)
        │         │
        │         └──────────────► CODE_COMPLETE ──► TESTING ──► [vuelve a decisión]
        │
        └──────────────────────────────────────────────┐
                                                       │
           (usuario aprobó código funcional)           │
                                                       │
                        ┌──────────────────────────────┘
                        │
                        ▼
                 ┌──────────────────────────────────┐
                 │ MAPPED                           │
                 │ • mapper-writer documentó        │
                 │ • Rol: mapper-writer             │
                 │ • Codebase ahora en bóveda       │
                 └────────────────┬─────────────────┘
                                  │
                       ┌──────────┴──────────┐
                       │                     │
                       ▼                     ▼
                   COHERENTE           INCONSISTENTE
                       │                     │
         ┌─────────────▼─────────────┐       │
         │ COMPLETE                  │       │
         │ • Tarea cerrada           │       │
         │ • Entra: usuario/pm       │       │
         └───────────────────────────┘       │
                                             ▼
                        ┌────────────────────────────┐
                        │ FIX_REQUIRED (desde MAPPED)│
                        │ • mapper-reader encontró   │
                        │ • divergencia código↔docs  │
                        │ • Entra: dev (arregla)     │
                        └────────────────────────────┘
```

### Tabla de sub-estados de tarea

| Sub-estado | Significa | Entra | Produce | Sale a |
|---|---|---|---|---|
| **PENDING** | Especificada, sin empezar | `dev` | — | `CODING` |
| **CODING** | En desarrollo | — (ocupada por dev) | Código + tests | `CODE_COMPLETE` |
| **CODE_COMPLETE** | Código + tests escritos (listos) | `qa-tester` | Verificación | `TESTING` |
| **TESTING** | Suite ejecutándose | — (ocupada por qa-tester) | Resultado | `TEST_PASSED` o `TEST_FAILED` |
| **TEST_PASSED** | Pruebas verdes ✅ | `mapper-writer` | Documentación | `MAPPED` |
| **TEST_FAILED** | Pruebas rojas ❌ | `debugger` | Diagnóstico | `DEBUG_ANALYSIS` |
| **DEBUG_ANALYSIS** | Debugging en progreso | — (ocupada por debugger) | Análisis + causa raíz | `FIX_REQUIRED` |
| **FIX_REQUIRED** | Debugger indicó qué cambiar | `dev` | Código corregido | `CODING` (vuelve al ciclo) |
| **MAPPED** | Mapper documentó en bóveda | `mapper-reader` (validar coherencia) | Validación | `COMPLETE` o `FIX_REQUIRED` |
| **COMPLETE** | Cerrada, validada, en mapa | — | — | Archivada |

### Propiedades del ciclo de tareas

- **Sin límite de vueltas:** `CODING` → `CODE_COMPLETE` → `TESTING` → `TEST_FAILED` → `DEBUG_ANALYSIS` → `FIX_REQUIRED` → `CODING` (no hay tope).
- **Contador de iteraciones:** cada vez que vuelve a `FIX_REQUIRED`, se incrementa `iteracion`. El PM alerta si > 3.
- **Validación obligatoria:** no entra en `MAPPED` sin haber pasado `TEST_PASSED`.
- **Mapeo no regresivo:** una vez en `MAPPED`, no baja a `CODE_COMPLETE` ni antes.

---

## 2. Estados de META (`estado`) — Ciclo de Planificación y Aprobación

Una meta progresa desde planificación hasta cierre:

```
┌─────────────────────────────────────┐
│ PLANIFICANDO                        │
│ • planner entrevistando usuario     │
│ • Fases: visión → alcance → metas   │
│ • Sub-fases: metas → tareas         │
│ • Usuario aún no aprobó             │
└────────────────┬────────────────────┘
                 │
         ┌───────┴────────┐
         │ ¿Usuario aprueba?
         │ (todo el árbol completo)
         │
      No│                │Sí
        │                │
        └────────────────┘  (regresa si falta)
               │
               ▼
┌──────────────────────────────────────┐
│ ACTIVA                               │
│ • Tareas en ejecución                │
│ • El plan fue aprobado               │
│ • Ciclo de tarea en progreso         │
│ (sub-estados: PENDING→CODING→...     │
│              CODE_COMPLETE→TESTING) │
└───────────────┬──────────────────────┘
                │
      ┌─────────┴──────────┐
      │ ¿Todas las tareas   │
      │ en MAPPED/COMPLETE? │
      │
   No │                  Sí │
      │                     │
      └─────────────────────┘  (ciclo de tarea continúa)
                │
                ▼
┌──────────────────────────────────────┐
│ EN_VALIDACION                        │
│ • Todas tareas: MAPPED o COMPLETE    │
│ • validator ejecutando pruebas ácidas│
│ • Checklist: seguridad, rendimiento, │
│   cobertura, criterios de ALCANCE    │
│ • pm pone este estado (no es decisión│
│   automática)                        │
└────────────┬───────────────────────┬─┘
             │                       │
         ¿Pasa?                      │
             │                       │
          Sí │          No           │
             │           │           │
             ▼           ▼           │
         VALIDADA    ACTIVA◄─────────┘
             │       (tareas a FIX_REQUIRED)
             │       (validator devuelve)
             │
             ├──► ¿Usuario aprueba?
             │    (contra ALCANCE.md)
             │
          Sí │         No
             │          │
             │          └──► ACTIVA (nuevas tareas)
             │
             ▼
      ┌────────────────────┐
      │ CERRADA            │
      │ • Usuario aprobó   │
      │ • Archivada en     │
      │ _archivo/          │
      │ • Meta COMPLETADA  │
      └────────────────────┘

(En cualquier momento, si hay bloqueo externo:)
             │
             ▼
      ┌────────────────────┐
      │ BLOQUEADA          │
      │ • Dependen externas│
      │ • Entra: cuando se │
      │ detecta bloqueo     │
      │ • Sale: a ACTIVA   │
      │ al desbloquear     │
      └────────────────────┘
```

### Tabla de estados de meta

| Estado | Significa | Lo pone | Entra | Sale a |
|---|---|---|---|---|
| **PLANIFICANDO** | Planner descomponiendo; usuario sin aprobar | `planner` | `planner` | `ACTIVA` (al aprobar usuario) o `PLANIFICANDO` (al iterar) |
| **ACTIVA** | Tareas en ejecución tras aprobación de plan | `planner` (tras aprobación) o `validator` (si rechaza) | Tareas `dev`, `qa-tester`, etc. | `EN_VALIDACION` (cuando todas tareas MAPPED/COMPLETE) |
| **EN_VALIDACION** | Todas tareas cerradas; validator verifica | `pm` (detección automática) | `validator` | `VALIDADA` (si OK) o `ACTIVA` (si falla) |
| **VALIDADA** | Validator OK; espera aprobación del usuario | `validator` | — (espera usuario) | `CERRADA` (si usuario aprueba) o `ACTIVA` (si usuario pide cambios) |
| **CERRADA** | Usuario aprobó; meta completada | **Usuario** (registra `pm`) | — (final) | `_archivo/` (archivada) |
| **BLOQUEADA** | Bloqueada por dependencia externa | Cualquiera (que detecte bloqueo) | — (en espera) | `ACTIVA` (al desbloquear) |

### Propiedades del ciclo de meta

- **Iteración obligatoria:** el usuario debe aprobar en dos puntos: plan (antes de `ACTIVA`) y resultado (antes de `CERRADA`).
- **Validación no es aprobación:** `VALIDADA` ≠ `CERRADA`. El usuario es quien cierra.
- **Retroceso controlado:** `EN_VALIDACION` → `ACTIVA` o `VALIDADA` → `ACTIVA` son transiciones válidas; el usuario rechaza explícitamente.
- **Bloqueo intercambiable:** puede entrar en cualquier momento, desde cualquier estado.

---

## 3. Roles y sus Sub-Estados

Cada rol entra en un conjunto de sub-estados definidos. No hay ambigüedad:

| Rol | Entra en (sub-estado) | Produce | Sale a |
|---|---|---|---|
| **planner** | `PLANIFICANDO` (META) | Plan aprobado | `ACTIVA` (META) |
| **dev-backend** | `PENDING`, `FIX_REQUIRED` | Código + tests | `CODE_COMPLETE` |
| **dev-frontend** | `PENDING`, `FIX_REQUIRED` | Componentes + E2E | `CODE_COMPLETE` |
| **qa-tester** | `CODE_COMPLETE` | Veredicto pasa/falla | `TEST_PASSED` o `TEST_FAILED` |
| **debugger** | `TEST_FAILED` | Diagnóstico de causa raíz | `DEBUG_ANALYSIS` → `FIX_REQUIRED` |
| **mapper-writer** | `TEST_PASSED` | Documentación en bóveda + ADR | `MAPPED` |
| **mapper-reader** | `MAPPED` | Validación coherencia código↔docs | `COMPLETE` o `FIX_REQUIRED` |
| **validator** | `EN_VALIDACION` (META) | Verificación ácidas/seguridad | `VALIDADA` o `ACTIVA` (META) |
| **framework-bootstrapper** | Fase 0 (proyecto vacío) | Estructura instalada | Listo para `planner` |

---

## 4. Transiciones de Estado — Matriz de Validez

### Transiciones de Sub-Estado (TAREA)

| Desde | A | Válida | Nota |
|---|---|---|---|
| `PENDING` | `CODING` | ✅ | dev inicia |
| `CODING` | `CODE_COMPLETE` | ✅ | dev termina desarrollo |
| `CODE_COMPLETE` | `TESTING` | ✅ | qa-tester inicia |
| `TESTING` | `TEST_PASSED` | ✅ | pruebas verdes |
| `TESTING` | `TEST_FAILED` | ✅ | pruebas rojas |
| `TEST_PASSED` | `MAPPED` | ✅ | mapper-writer documenta |
| `TEST_FAILED` | `DEBUG_ANALYSIS` | ✅ | debugger diagnostica |
| `DEBUG_ANALYSIS` | `FIX_REQUIRED` | ✅ | debugger termina análisis |
| `FIX_REQUIRED` | `CODING` | ✅ | dev arregla |
| `MAPPED` | `COMPLETE` | ✅ | mapper-reader valida ✓ |
| `MAPPED` | `FIX_REQUIRED` | ✅ | mapper-reader valida ✗ |
| Cualquier otra | — | ❌ | No permitida |

### Transiciones de Estado (META)

| Desde | A | Válida | Nota |
|---|---|---|---|
| `PLANIFICANDO` | `PLANIFICANDO` | ✅ | planner itera con usuario |
| `PLANIFICANDO` | `ACTIVA` | ✅ | usuario aprueba plan |
| `ACTIVA` | `ACTIVA` | ✅ | tareas ciclando |
| `ACTIVA` | `EN_VALIDACION` | ✅ | pm detecta todas tareas MAPPED |
| `EN_VALIDACION` | `VALIDADA` | ✅ | validator OK |
| `EN_VALIDACION` | `ACTIVA` | ✅ | validator rechaza |
| `VALIDADA` | `CERRADA` | ✅ | usuario aprueba |
| `VALIDADA` | `ACTIVA` | ✅ | usuario rechaza |
| `CERRADA` | — | 🔒 | Final, no hay salida |
| Cualquiera | `BLOQUEADA` | ✅ | bloqueo externo |
| `BLOQUEADA` | origen | ✅ | se resuelve bloqueo |
| Cualquier otra | — | ❌ | No permitida |

---

## 5. Relaciones entre Estados de Meta y Tarea

```
META: PLANIFICANDO
  └─ Tareas: no existen aún

META: ACTIVA
  └─ Tareas: PENDING, CODING, CODE_COMPLETE, TESTING, 
             TEST_PASSED, TEST_FAILED, DEBUG_ANALYSIS, 
             FIX_REQUIRED, MAPPED
  
META: EN_VALIDACION
  └─ Tareas: todas en MAPPED o COMPLETE
           (ninguna en PENDING, CODING, TESTING, etc.)

META: VALIDADA
  └─ Tareas: todas en COMPLETE (mapper-reader validó ✓)

META: CERRADA
  └─ Tareas: todas en COMPLETE (archivadas)

META: BLOQUEADA
  └─ Tareas: congeladas en su sub-estado actual
```

---

## 6. Propiedad de Estados

### Quién puede cambiar cada estado

| Estado | Quién lo pone | Puede iterarlo | Quién revierte |
|---|---|---|---|
| Sub-estados de tarea | El rol que actúa | El mismo rol (itera) | `debugger` (devuelve a `FIX_REQUIRED`) |
| `PLANIFICANDO` (meta) | `planner` | `planner` (itera) | Usuario (rechaza plan) |
| `ACTIVA` (meta) | `planner` o `validator` | Automático (ciclo de tareas) | `validator` (rejects) o usuario (rechaza) |
| `EN_VALIDACION` (meta) | `pm` (detecta) | No | `validator` (rechaza) |
| `VALIDADA` (meta) | `validator` | No | Usuario (rechaza) |
| `CERRADA` (meta) | **Usuario** (registra `pm`) | No | 🔒 Irreversible |
| `BLOQUEADA` (meta) | Cualquiera (detecta) | No | Quien detecta que se resolvió |

---

## 7. Anti-patrones y Restricciones

### Prohibido

- ❌ Tarea salta de `PENDING` a `TEST_PASSED` sin pasar por `CODING`, `CODE_COMPLETE`, `TESTING`.
- ❌ Tarea va de `MAPPED` a `CODING` (no regresa más allá de `FIX_REQUIRED`).
- ❌ Meta pasa de `EN_VALIDACION` a `CERRADA` sin pasar por `VALIDADA`.
- ❌ Meta con tareas en `CODING` entra en `EN_VALIDACION`.
- ❌ Usuario no aprobó plan, pero tareas empiezan en `PENDING` (meta debe estar `ACTIVA`).
- ❌ Tarea `COMPLETE` vuelve a `CODING`.
- ❌ Meta `CERRADA` se desarchiva; si hay cambios, es una nueva meta.

### Fuertemente recomendado

- ✅ `iteracion` ≤ 3 (si supera, es señal de falta de claridad en el problema).
- ✅ `MAPPED` antes de `COMPLETE` (no hay "directos").
- ✅ `VALIDADA` antes de `CERRADA` (siempre hay validación).
- ✅ Usuario aprueba en dos puntos críticos: plan y resultado.

---

## 8. Registro Canónico

### En `T-*.md` (tarea)

```yaml
---
id: T-001
meta: M-001
titulo: Pantalla de login
tipo: pantalla
spec: SCR-AUTH-001
sub_estado: TESTING          # ← ÚNICO valor permitido
siguiente_rol: qa-tester     # ← rol que actúa en este estado
iteracion: 1
bloqueadores: ""
actualizado: 2026-08-13T10:45:30Z
---
```

### En `META.md` (meta)

```yaml
---
id: M-001
titulo: Autenticación y autorización
estado: ACTIVA               # ← ÚNICO valor permitido
criterios_done:
  - "Login funciona con email/password"
  - "JWT válido por 7 días"
tareas_totales: 5
tareas_completadas: 3
actualizado: 2026-08-13T10:45:30Z
---
```

---

## 9. Gobernanza de este Documento

Este documento es **fuente única y de verdad** sobre estados. Cuando otros documentos hablen de estados:

- [`Implementation_Log_Standard.md`](../07_Documentation/Implementation_Log_Standard.md) → remite aquí para definiciones.
- [`Agent_Roles_And_Lifecycle.md`](Agent_Roles_And_Lifecycle.md) → remite aquí para diagramas.
- [`Preloaded_Agent_Roles.md`](Preloaded_Agent_Roles.md) → remite aquí para transiciones.
- `PROJECT_STATUS.md` o similar → remite aquí.

Si hay conflicto entre este documento y otro, **este gana**. Actualizar otros documentos para que remitan aquí.

### Actualizaciones

Cambios a estados:
- MAJOR: nuevo estado o transición eliminada/invertida.
- MINOR: refinamiento de transiciones existentes, mejora de claridad.
- PATCH: corrección de error tipográfico o diagrama.

Registrar en [`../07_Documentation/ADR.md`](../07_Documentation/ADR.md) con ADR-* correspondiente.

---

## Relacionado

- [`../07_Documentation/Implementation_Log_Standard.md`](../07_Documentation/Implementation_Log_Standard.md) — zona compartida con estructura.
- [`Agent_Roles_And_Lifecycle.md`](Agent_Roles_And_Lifecycle.md) — ciclo de vida y roles (remite aquí para estados).
- [`Preloaded_Agent_Roles.md`](Preloaded_Agent_Roles.md) — roles especializados (remite aquí para estados).
- [`Project_Manager.md`](Project_Manager.md) — observador de estados.
- [`../09_AI/Agent_Workflow.md`](Agent_Workflow.md) — cómo un agente navega los estados.
