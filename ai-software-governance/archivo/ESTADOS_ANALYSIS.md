---
title: Análisis de Estados — Contradicciones y Unificación
date: 2026-08-13
---

# Análisis Integral de Estados en el Framework

## Propósito

Revisar **todos los estados** definidos en el framework y detectar:
1. **Contradicciones** — estados con mismo significado pero distinto nombre.
2. **Duplicidades** — estados que se repiten sin agregar valor.
3. **Huecos** — transiciones que faltan o no están claras.
4. **Ambigüedades** — roles que pueden entrar en varios estados simultáneamente.

---

## 1. Inventario de todos los estados

### A. Estados de TAREA (sub-estado) — Implementation_Log_Standard.md

| Sub-estado | Significado | Entra | Produces |
|---|---|---|---|
| `PENDING` | Especificada, sin empezar | `dev` | Código del dev |
| `CODING` | En desarrollo | — (ocupada) | — |
| `CODE_COMPLETE` | Código + tests escritos | `test-runner` | Veredicto |
| `TESTING` | Ejecutando suite | — (ocupada) | — |
| `TEST_PASSED` | Pruebas verdes | `mapper` | Documentación |
| `TEST_FAILED` | Pruebas rojas | `debugger` | Diagnóstico |
| `DEBUG_ANALYSIS` | Debugger investigando | — (ocupada) | Qué cambiar |
| `FIX_REQUIRED` | Debugger indicó cambios | `dev` (vuelve a CODING) | Código corregido |
| `MAPPED` | Mapper documentó | — | — |
| `COMPLETE` | Cerrada | — | — |

**Total: 10 sub-estados de tarea**

---

### B. Estados de META (estado) — Agent_Roles_And_Lifecycle.md

| Estado | Significado | Entra | Lo produce | Sale a |
|---|---|---|---|---|
| `PLANIFICANDO` | Initiator descomponiendo | Inicio | `initiator` | `ACTIVA` (al aprobar usuario) |
| `ACTIVA` | Tareas en ejecución | `initiator` aprueba | `initiator`/`validator`/usuario | `EN_VALIDACION` o `ACTIVA` (loop) |
| `EN_VALIDACION` | Tareas cerradas; validator trabaja | Todas T → `MAPPED`/`COMPLETE` | `pm` | `VALIDADA` o `ACTIVA` (si falla) |
| `VALIDADA` | Validator OK; espera usuario | Validator OK | `validator` | `CERRADA` o `ACTIVA` (si usuario rechaza) |
| `CERRADA` | Usuario aprobó | Usuario aprueba | **Usuario** (registra `pm`) | `_archivo/` |
| `BLOQUEADA` | Bloqueada por dependencia | Cualquiera detecta | Cualquiera | `ACTIVA` (al desbloquear) |

**Total: 6 estados de meta**

---

### C. Estados de ROL (en Preloaded_Agent_Roles.md)

#### planner
| Rol | Sub-estados |
|---|---|
| `planner` | `PLANIFICANDO` → `ACTIVA` |
| `task-planner` | `PLANIFICANDO` → `ACTIVA` |

#### dev-backend / dev-frontend
| Rol | Sub-estados |
|---|---|
| `dev-backend` | `PENDING` → `CODING` → `CODE_COMPLETE` |
| `dev-frontend` | `PENDING` → `CODING` → `CODE_COMPLETE` |

#### qa-tester
| Rol | Sub-estados |
|---|---|
| `qa-tester` | `CODE_COMPLETE` → `TESTING` → `TEST_PASSED` / `TEST_FAILED` |

#### mapper roles
| Rol | Sub-estados |
|---|---|
| `mapper-writer` | `TEST_PASSED` → `MAPPED` |
| `mapper-reader` | "en cualquier momento" (no sub-estado ocupado) |

#### debugger
| Rol | Sub-estados |
|---|---|
| `debugger` | `TEST_FAILED` → `DEBUG_ANALYSIS` → `FIX_REQUIRED` |

#### otros
| Rol | Sub-estados |
|---|---|
| `framework-bootstrapper` | Fase 0 (no entra en ciclo) |

---

## 2. CONTRADICCIONES DETECTADAS

### Contradicción 1: ¿Dónde entra el `planner` / `task-planner`?

**En Preloaded_Agent_Roles.md:**
```
planner: 
  - Entrada: docs/00_Proyecto/ (visión, alcance)
  - Sub-estados: PLANIFICANDO → ACTIVA

task-planner:
  - Entrada: META aprobada
  - Sub-estados: PLANIFICANDO → ACTIVA
```

**Problema:** `PLANIFICANDO` y `ACTIVA` son **estados de META**, no de TAREA. Pero el `Preloaded_Agent_Roles.md` los asigna a roles de planificación.

**Conflicto con Agent_Roles_And_Lifecycle.md:**
- `PLANIFICANDO` = "el initiator descompone y el usuario **no** aprobó"
- `ACTIVA` = "tareas **en ejecución** tras aprobación del usuario"

Los roles `planner` y `task-planner` del Preloaded_Agent_Roles.md son en realidad **refinamientos del rol `initiator`**. No son fases de tarea, son fases del planeo.

---

### Contradicción 2: ¿Quién entra en `EN_VALIDACION`?

**En Agent_Roles_And_Lifecycle.md:**
```
EN_VALIDACION: 
  - Lo pone: pm
  - Entra: validator
```

**En Preloaded_Agent_Roles.md:**
- No hay rol llamado `validator`.
- Existe `mapper-reader` que valida coherencia código ↔ docs.

**Conflicto:** 
- `validator` en Agent_Roles_And_Lifecycle = pruebas ácidas, seguridad, edge cases a nivel de META.
- `mapper-reader` en Preloaded_Agent_Roles = coherencia entre código y documentación.

Son **roles distintos con responsabilidades distintas**, pero el nombre "validación" se mezcla.

---

### Contradicción 3: `mapper-reader` sin sub-estado fijo

**En Preloaded_Agent_Roles.md:**
```
mapper-reader:
  - Sub-estados: "Entra en cualquier momento (no es sub-estado ocupado)"
  - Produce: Reporte append-only
  - Iteración: Una sola pasada
```

**Conflicto con Implementation_Log_Standard.md:**
- Todos los sub-estados de tarea son **ocupados** o **finales**.
- `mapper-reader` no entra en ninguno de ellos.

**¿Cuándo entra realmente?**
- ¿Después de `mapper-writer` documenta? (MAPPED)
- ¿A demanda, siempre que quiera? (Sin sub-estado)
- ¿Solo si hay divergencia? (Condicional)

---

### Contradicción 4: ¿Meta se valida en `VALIDADA` o en `EN_VALIDACION`?

**En Agent_Roles_And_Lifecycle.md:**
```
EN_VALIDACION: "validator trabaja"
VALIDADA: "validator dio OK; falta aprobación del usuario"
```

**Problema:** El `validator` entra en `EN_VALIDACION` y **produce** que la meta llegue a `VALIDADA`. Pero Preloaded_Agent_Roles NO define rol `validator`.

**¿Quién es el validator?**
- ¿Un rol adicional a los 7?
- ¿El mapper-reader?
- ¿El qa-tester al final?
- ¿El pm?

---

### Contradicción 5: Estados intermedios "ocupados" sin rol asignado

**En Implementation_Log_Standard.md:**
```
CODING: "— (ocupada)"
TESTING: "— (ocupada)"
DEBUG_ANALYSIS: "— (ocupada)"
```

**Preguntas sin respuesta:**
- ¿Quién **debe** estar en `CODING`? Claramente `dev-backend` o `dev-frontend`, pero no está registrado.
- ¿Quién **debe** estar en `TESTING`? Claramente `qa-tester`, pero la columna dice "— (ocupada)".
- ¿Quién **debe** estar en `DEBUG_ANALYSIS`? Claramente `debugger`, pero la tabla no lo dice.

---

## 3. DUPLICIDADES DETECTADAS

### Duplicidad 1: `PLANIFICANDO` vs. dos roles planner

**En Agent_Roles_And_Lifecycle.md:**
```
Fase 0: initiator → VISION + ALCANCE
Fase 1: initiator → metas (METAS)
        initiator → tareas (TAREAS)
```

**En Preloaded_Agent_Roles.md:**
```
planner: PLANIFICANDO → ACTIVA
task-planner: PLANIFICANDO → ACTIVA
```

**Resultado:** Tres roles hacen planificación:
1. `initiator` (legado de Agent_Roles_And_Lifecycle)
2. `planner` (nuevo en Preloaded_Agent_Roles)
3. `task-planner` (nuevo en Preloaded_Agent_Roles)

**¿Cuál es el verdadero?** ¿O son especializaciones del initiator?

---

### Duplicidad 2: `mapper` vs. `mapper-writer` + `mapper-reader`

**En Agent_Roles_And_Lifecycle.md:**
```
mapper: "TEST_PASSED → Mapeo del código funcional"
```

**En Preloaded_Agent_Roles.md:**
```
mapper-writer: "TEST_PASSED → Documenta código en bóveda"
mapper-reader: "Valida coherencia código ↔ docs"
```

**Resultado:** 
- Antes: 1 rol `mapper` hacía todo.
- Ahora: 2 roles especializados `mapper-writer` + `mapper-reader`.

Esto es **bueno** (separación de responsabilidades), pero **no está unificado** en las dos referencias.

---

### Duplicidad 3: `doc-expert` vs. `/obsidian` skill

**En Agent_Roles_And_Lifecycle.md:**
```
doc-expert: "Oráculo y custodio de la bóveda"
            "Escribe toda docs/ EXCEPTO 07_Implementacion/"
```

**En Preloaded_Agent_Roles.md:**
```
No aparece rol doc-expert explícitamente.
Pero varios roles usan skill /obsidian:
  - planner: /obsidian
  - task-planner: /obsidian
  - mapper-writer: /obsidian
  - mapper-reader: /obsidian
```

**¿Quién es el "dueño" de `/obsidian`?** ¿El `doc-expert` o varios roles lo usan?

---

## 4. HUECOS Y TRANSICIONES FALTANTES

### Hueco 1: ¿Quién entra entre `MAPPED` y `COMPLETE`?

**En Implementation_Log_Standard.md:**
```
MAPPED → COMPLETE
```

**Pero:**
- `mapper-writer` entra en `TEST_PASSED` y produce `MAPPED`.
- Luego ¿qué? ¿Entra `mapper-reader` para validar?
- ¿O pasa directamente a `COMPLETE`?

---

### Hueco 2: ¿Quién entra en `VALIDADA` / `EN_VALIDACION`?

**En Agent_Roles_And_Lifecycle.md:**
```
EN_VALIDACION: validator trabaja
```

**Pero en Preloaded_Agent_Roles.md:**
- No existe rol `validator`.
- ¿Es `mapper-reader`?
- ¿Es un 8º rol que falta?

---

### Hueco 3: ¿Quién pone la META en `CERRADA`?

**En Agent_Roles_And_Lifecycle.md:**
```
CERRADA: lo pone **solo el usuario** (registra pm)
```

**Pero ¿cómo?**
- ¿El usuario escribe en el archivo?
- ¿El pm lo registra tras una orden del usuario?
- ¿Hay una interacción clara?

---

### Hueco 4: Transición `ACTIVA` ↔ `EN_VALIDACION`

**En Agent_Roles_And_Lifecycle.md:**
```
EN_VALIDACION ──validator encuentra defectos──► ACTIVA
```

**Pero:**
- ¿Cuáles son "defectos"?
- ¿Todas las tareas vuelven a `FIX_REQUIRED` o solo algunas?
- ¿Quién decide cuál tarea se abre de nuevo?

---

## 5. AMBIGÜEDADES POR RESOLVER

### Ambigüedad 1: ¿Un `planner` o tres roles de planificación?

**Opción A (integrado):**
```
initiator → planner (único)
  - PLANIFICANDO (entrevista)
  - ACTIVA (descompone)
  - Responsable de: visión, alcance, metas, tareas
```

**Opción B (especializado — actual en Preloaded_Agent_Roles):**
```
initiator → entrevista y visión
planner → genera metas
task-planner → genera tareas
```

**Recomendación:** El Preloaded_Agent_Roles tiene razón en especializar, pero falta claridad en cuándo entra cada uno.

---

### Ambigüedad 2: ¿El `validator` es rol o es responsabilidad del `mapper-reader`?

**Opción A:**
```
8 roles de Preloaded_Agent_Roles + validator (9º)
```

**Opción B:**
```
mapper-reader hace validación de coherencia
(Pero no hace validación de ácidas/seguridad/rendimiento que pide Lifecycle)
```

**Opción C:**
```
No hay validator. Las pruebas ácidas las hace el qa-tester.
La coherencia la valida el mapper-reader.
El usuario es quien da OK final.
```

---

### Ambigüedad 3: ¿Los sub-estados de tarea son deterministas o probabilísticos?

**Problema:**
```
TESTING → (test-runner ejecuta)
  └─ TEST_PASSED o TEST_FAILED ← determinista
  
Pero en Preloaded_Agent_Roles:
qa-tester → TESTING → TEST_PASSED / TEST_FAILED
```

¿Qué pasa si el test-runner ejecuta pero el qa-tester entra? ¿Es el mismo rol o dos?

---

## 6. RECOMENDACIONES DE UNIFICACIÓN

### Recomendación 1: Consolidar la planificación en el ciclo de META

**Cambio propuesto en Preloaded_Agent_Roles.md:**

Reemplazar:
```
- planner
- task-planner
```

Por:
```
- planner (rol único de planificación)
  - Entra en: META con estado PLANIFICANDO
  - Sub-fases:
    1. Entrevista (VISION + ALCANCE)
    2. Descompone en METAS
    3. Descompone en TAREAS
  - Sale con: META estado ACTIVA (tras aprobación del usuario)
```

**Justificación:** Agent_Roles_And_Lifecycle.md ya lo define como `initiator`. Unificar evita confusión.

---

### Recomendación 2: Esclarecer rol `validator`

**Opción recomendada:**

Agregar a Preloaded_Agent_Roles.md como **rol 9 (optativo):**

```yaml
### 9. **Validator** (`validator`)

**Responsabilidad:** Ejecuta pruebas ácidas, verifica seguridad y rendimiento, comprueba criterios de ALCANCE.

| Aspecto | Descripción |
|---|---|
| **Entrada** | META con todas tareas en `MAPPED`/`COMPLETE` |
| **Salida** | OK o lista de tareas a `FIX_REQUIRED` |
| **Skills precargados** | `/project-validate` (custom), `/obsidian` |
| **No hace** | Código, tests unitarios, debugging. |
| **Sub-estados** | `EN_VALIDACION` → `VALIDADA` (o devuelve a `ACTIVA`) |
```

---

### Recomendación 3: Unificar mapper-writer + mapper-reader + validator

**Problema actual:**
- `mapper-writer` documenta.
- `mapper-reader` valida coherencia código ↔ docs.
- `validator` valida ácidas/seguridad.

**Opción:** Hacer que `validator` sea **quien valida TODO** (coherencia + ácidas + seguridad):

```
mapper-writer (TEST_PASSED → MAPPED)
    ↓
validator (MAPPED → VALIDADA, o devuelve a FIX_REQUIRED)
    ↓
mapper-reader (VALIDADA → COMPLETE, o señala inconsistencias)
```

---

### Recomendación 4: Consolidar estados intermedios con roles

**En Implementation_Log_Standard.md, cambiar:**

```yaml
| CODING | "— (ocupada)" |  
| TESTING | "— (ocupada)" |
| DEBUG_ANALYSIS | "— (ocupada)" |
```

**A:**

```yaml
| CODING | dev-backend o dev-frontend en progreso |
| TESTING | qa-tester en progreso |
| DEBUG_ANALYSIS | debugger en progreso |
```

---

### Recomendación 5: Definir transición `MAPPED` → `COMPLETE`

**Propuesta:**

```
Si mapper-reader valida coherencia:
  MAPPED → COMPLETE (automático, sin rol intermedio)

Si hay inconsistencia:
  MAPPED → FIX_REQUIRED (mapper-reader reporta, dev arregla)
```

---

## 7. TABLA DE CONSOLIDACIÓN

Después de aplicar las recomendaciones, los estados quedarían así:

### Sub-estados de TAREA (sin cambios):
```
PENDING
  ├→ CODING
  │   └→ CODE_COMPLETE
  │       └→ TESTING
  │           ├→ TEST_PASSED
  │           │   └→ MAPPED
  │           │       └→ COMPLETE
  │           └→ TEST_FAILED
  │               └→ DEBUG_ANALYSIS
  │                   └→ FIX_REQUIRED
  │                       └→ CODING (ciclo)
```

### Estados de META (unificados):
```
PLANIFICANDO (planner entrevista + descompone)
  └→ ACTIVA (usuario aprueba plan)
      └→ EN_VALIDACION (todas tareas MAPPED; validator trabaja)
          ├→ VALIDADA (validator OK)
          │   └→ CERRADA (usuario aprueba)
          └→ ACTIVA (validator falla; tareas a FIX_REQUIRED)
               └→ EN_VALIDACION (reintento)

BLOQUEADA (en cualquier estado, se puede interponer)
  └→ ACTIVA (dependen se resuelven)
```

### Roles de TAREA (unificados):
```
planner (META: PLANIFICANDO → ACTIVA)
dev-backend / dev-frontend (T: PENDING/FIX_REQUIRED → CODE_COMPLETE)
qa-tester (T: CODE_COMPLETE → TEST_PASSED/TEST_FAILED)
debugger (T: TEST_FAILED → FIX_REQUIRED)
mapper-writer (T: TEST_PASSED → MAPPED)
validator (M: EN_VALIDACION → VALIDADA/ACTIVA)
mapper-reader (T: MAPPED → COMPLETE / o FIX_REQUIRED si falla)
framework-bootstrapper (fase 0)
```

---

## 8. ACCIONES NECESARIAS

1. **Actualizar Preloaded_Agent_Roles.md:**
   - Remover `planner` y `task-planner` separados; integrar en un `planner` único.
   - Agregar rol `validator` (9º).
   - Clarificar transiciones.

2. **Actualizar Implementation_Log_Standard.md:**
   - Cambiar "— (ocupada)" por el rol específico en cada sub-estado.

3. **Actualizar Agent_Roles_And_Lifecycle.md:**
   - Alinear `initiator` con el nuevo `planner`.
   - Confirmar o negar la necesidad de `validator`.

4. **Crear Sub_States_Definition.md:**
   - Documento canónico con **todos** los estados (tarea + meta) en un solo lugar.
   - Tabla de transiciones permitidas.
   - Cuál rol entra en cada estado.

5. **Audit en plantillas:**
   - `Templates/Implementation_Log_Template/META_Template.md` → confirmar estados de meta.
   - `Templates/Implementation_Log_Template/TAREA_Template.md` → confirmar sub-estados.

---

## Conclusión

**Hallazgos:**
- ✅ El sistema es **coherente en su lógica** (roles + sub-estados se complementan).
- ⚠️ Hay **duplicidades** en la definición de roles (`initiator` vs. `planner` vs. `task-planner`).
- ⚠️ Falta claridad en el **rol `validator`** — ¿existe o es responsabilidad del `mapper-reader`?
- ⚠️ Los **estados intermedios** no registran quién debe estar ahí.
- 🔧 Se necesita **consolidación en un único documento canónico** de estados.

**Siguiente paso:** Crear el documento unificado `Sub_States_Definition.md` y resolver las 5 recomendaciones arriba.
