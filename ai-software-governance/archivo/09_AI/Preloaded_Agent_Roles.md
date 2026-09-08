---
obligation: standard
area: ai-governance
applies_to: all projects
---

# Roles de Agentes Precargados

## Propósito

Definir **7 roles de agentes especializados** que vienen "lista para usar" con el framework. Cada uno trae sus skills precargados y responsabilidades claras. El proyecto los configura en `AGENT_CONFIG.md` y los invoca según la fase del ciclo de vida.

Estos roles **no son obligatorios** — son referencias de cómo especializar agentes reales (Claude Code, OpenCode, Codex, Whale) en el contexto de tu proyecto. Puedes usar todos, algunos, o ninguno. Pero si los usas, siguen este estándar.

---

## Los 8 roles precargados (actualizado)

> **NOTA IMPORTANTE:** Este documento define roles operacionales. Los estados (`PLANIFICANDO`, `ACTIVA`, etc.) están unificados en [`Unified_States_Standard.md`](Unified_States_Standard.md). Remite allá para la matriz completa de transiciones, validez y ciclo de vida de estado.

### 1. **Iniciador del Framework** (`framework-bootstrapper`)

**Responsabilidad:** Instala el framework en un proyecto nuevo, estructura las carpetas, configura los agentes y asegura que esté listo para usar.

| Aspecto | Descripción |
|---|---|
| **Entrada** | Proyecto vacío o herencia de código sin gobernanza |
| **Salida** | Proyecto con:  `.governance/` (submódulo anclado), `AGENTS.md`, `INIT.md`, `AGENT_CONFIG.md` por herramienta, `docs/00_Proyecto/`, `docs/07_Implementacion/`, todos los skills instalados, `.aicodeprotect.yml`, entornos configurados. |
| **Skills precargados** | Ninguno (o `/obsidian` si necesita escribir docs iniciales) |
| **No hace** | Implementación de aplicación. Solo **andamiaje**. |
| **Sub-estados** | No entra en el ciclo de tareas/metas; es un rol de **fase 0**. |
| **Iteración** | Puede iterar con el humano si la estructura no encaja. Una vez termina, el `planner` toma. |

**Cuándo entra:**
- Siempre, en un proyecto **nuevo**.
- Rara vez después: solo si hay reorganización mayor.

**Cuándo sale:**
- Todo está configurado y el `planner` puede arrancar.

---

### 2. **Planeador** (`planner`)

**Responsabilidad:** Especialista en planificación integral. Entiende el proyecto completo, entrevista al usuario, construye la visión, descompone en metas y tareas.

> **Unificación:** Este rol integra las tres fases de planificación que antes estaban separadas: `initiator` (entrevista), `planner` (metas), `task-planner` (tareas). Ahora es un único rol con tres **sub-fases** internas.

| Aspecto | Descripción |
|---|---|
| **Entrada** | Proyecto vacío o nueva meta solicitada por usuario |
| **Salida** | Plan maestro: `VISION.md`, `ALCANCE.md`, `META.md` (objetivo, scope, criterios), descomposición en `TAREA.md` (tipo: pantalla, servicio, test, manual) |
| **Skills precargados** | `/init-project` (entrevista), `/usecases` (requisitos), `/screens` (interfaz), `/obsidian` (persistencia) |
| **No hace** | Código, tests, ni implementación. Solo **especificación y planificación**. |
| **Sub-fases internas** | **Fase 1:** Entrevista + `VISION.md` + `ALCANCE.md` (META estado: `PLANIFICANDO`)<br>**Fase 2:** Descompone en metas (`META.md`)<br>**Fase 3:** Detalla tareas (`TAREA.md`) con specs (`UC-*`, `SCR-*`)<br>**Fin:** Usuario aprueba todo → META estado: `ACTIVA` |
| **Iteración** | Valida con usuario en cada sub-fase. Solo avanza si aprueba lo anterior. |

**Cuándo entra:**
- META en estado `PLANIFICANDO`.
- Usuario acaba de describir una nueva iniciativa.

**Cuándo sale:**
- Usuario aprueba el árbol completo (visión → metas → tareas).
- META pasa a estado `ACTIVA`.
- Delega a dev / qa-tester según cada tarea.

---

### 3. **Dev Backend** (`dev-backend`)

**Responsabilidad:** Implementa lógica de negocio, APIs, base de datos.

| Aspecto | Descripción |
|---|---|
| **Entrada** | Tareas tipo "servicio" en `sub_estado: PENDING` con spec `UC-*` |
| **Salida** | Código fuente + tests unitarios/integración; tarea pasa a `CODE_COMPLETE` |
| **Skills precargados** | Skill custom `/project-backend` (compilar, correr localmente, migrations, seeds) + `/obsidian` (documentación de API) |
| **No hace** | Interfaces, pruebas E2E, ni mapeo (eso es de otros). |
| **Sub-estados** | `PENDING` → `CODING` → `CODE_COMPLETE` |
| **Iteración** | Si tests fallan, vuelve a `FIX_REQUIRED` desde el `test-runner`. |

**Cuándo entra:**
- Cuando hay tarea con `siguiente_rol: dev` en `sub_estado: PENDING`.

**Cuándo sale:**
- Código escrito y tests propios en verde; pasa a `test-runner`.

---

### 4. **Dev Frontend** (`dev-frontend`)

**Responsabilidad:** Implementa interfaces, interacciones, integración con backend.

| Aspecto | Descripción |
|---|---|
| **Entrada** | Tareas tipo "pantalla" en `sub_estado: PENDING` con spec `SCR-*` |
| **Salida** | Componentes + tests E2E (Playwright); tarea pasa a `CODE_COMPLETE` |
| **Skills precargados** | Skill custom `/project-frontend` (servidor dev, build, types) + `/screens` (referencia de ficha) + `/obsidian` (documentación) |
| **No hace** | Backend, ni datos, ni mapeo. |
| **Sub-estados** | `PENDING` → `CODING` → `CODE_COMPLETE` |
| **Iteración** | Si tests fallan, vuelve a `FIX_REQUIRED`. |

**Cuándo entra:**
- Cuando hay tarea con `siguiente_rol: dev` y tipo "pantalla".

**Cuándo sale:**
- Componentes listos, E2E escritas; pasa a `test-runner`.

---

### 5. **QA Tester** (`qa-tester`)

**Responsabilidad:** Ejecuta tests, genera reportes, documentación manual con capturas.

| Aspecto | Descripción |
|---|---|
| **Entrada** | Código en `sub_estado: CODE_COMPLETE` |
| **Salida** | Tests ejecutados, filas en bitácora con resultado (PASS/FAIL), y si pasan: documentación manual generada con Playwright screenshots en `docs/manual/`. |
| **Skills precargados** | `/project-test` (correr suite, generar reportes) + `/project-manual-doc` (screenshot + markdown con instrucciones paso a paso) + `/obsidian` (publicar manual) |
| **No hace** | Código de producción, debugging. |
| **Sub-estados** | `CODE_COMPLETE` → `TESTING` → `TEST_PASSED` (o `TEST_FAILED` si falla) |
| **Iteración** | Si falla: reporta al `debugger` (tarea a `TEST_FAILED`). Si pasa: genera manual. |

**Cuándo entra:**
- Cuando hay tarea en `sub_estado: CODE_COMPLETE`.

**Cuándo sale:**
- Tests verdes y manual documentado; pasa a `mapper_writer`.

---

### 6. **Mapper Writer** (`mapper-writer`)

**Responsabilidad:** Documenta código funcional en la bóveda (ADR, API, flujos).

| Aspecto | Descripción |
|---|---|
| **Entrada** | Código en `sub_estado: TEST_PASSED` + contexto técnico de `AGENT_CONTEXT` |
| **Salida** | Documentación estructurada en `docs/04_Modulos/`, `docs/05_Procesos/`, ADR (`docs/02_Arquitectura/adr/`) |
| **Skills precargados** | `/obsidian` (escribe la bóveda), `/codebase-memory` (entiende el código), `/project-arch-doc` (genera ADR y diagramas) |
| **No hace** | Código, tests, ni debugging. |
| **Sub-estados** | `TEST_PASSED` → `MAPPED` |
| **Iteración** | Una sola pasada si tests están verdes. Si encuentra inconsistencias: señala al `mapper_reader`. |

**Cuándo entra:**
- Cuando hay tarea en `sub_estado: TEST_PASSED`.

**Cuándo sale:**
- Documentación integrada en la bóveda; tarea a `MAPPED` → `COMPLETE`.

---

### 7. **Mapper Reader** (`mapper-reader`)

**Responsabilidad:** Valida que el código coincida con la documentación; es el guardián de coherencia.

| Aspecto | Descripción |
|---|---|
| **Entrada** | Código + documentación en bóveda; entra en cualquier momento si hay divergencia. |
| **Salida** | Reporte de inconsistencias (código ≠ doc, módulo mal nomrado, falta ADR, etc.); si es grave, tarea devuelve a `FIX_REQUIRED`. |
| **Skills precargados** | `/codebase-memory` (lee código), `/obsidian` (lee docs), `/project-coherence` (valida mapping) |
| **No hace** | Escribir código ni docs; solo **validar que coincidan**. |
| **Sub-estados** | Entra "en cualquier momento" (no es sub-estado ocupado); genera un reporte append-only. |
| **Iteración** | Si todo ok: signoff en bitácora. Si falla: señala específicamente qué diverge. |

**Cuándo entra:**
- Después que el `mapper_writer` documenta, **como validación final**.
- O bajo demanda si hay duda sobre coherencia.

**Cuándo sale:**
- Reporte completado; tarea puede cerrarse si todo es coherente.

---

### 8. **Debugger** (`debugger`)

**Responsabilidad:** Diagnostica fallos en tests; no arregla, solo reporta.

| Aspecto | Descripción |
|---|---|
| **Entrada** | Tarea en `sub_estado: TEST_FAILED` |
| **Salida** | Análisis de causa raíz, hipótesis de qué cambiar, bitácora con entrada `DEBUG_ANALYSIS` |
| **Skills precargados** | `/project-debug` (herramientas de debugging locales), `/codebase-memory` (entiende la arquitectura) |
| **No hace** | Escribir código. Solo **diagnóstico**. |
| **Sub-estados** | `TEST_FAILED` → `DEBUG_ANALYSIS` → `FIX_REQUIRED` (devuelve al `dev_*`) |
| **Iteración** | Una sola pasada de análisis. Devuelve claramente a `dev_backend` o `dev_frontend`. |

**Cuándo entra:**
- Cuando hay tarea en `sub_estado: TEST_FAILED`.

**Cuándo sale:**
- Diagnosis completo; tarea a `FIX_REQUIRED` → vuelve al dev que corresponda.

---

## Resumen: ciclo de vida con los 8 roles

```
FASE 0: Proyecto nuevo
  framework-bootstrapper
     ├─ instala estructura
     └─ configura AGENT_CONFIG.md para cada herramienta

FASE 1-3: Planificación integral (antes: 3 roles separados; ahora: 1 planner)
  planner (unificado)
     ├─ Sub-fase 1: Entrevista → VISION + ALCANCE (META: PLANIFICANDO)
     ├─ Sub-fase 2: Descomposición → METAS (META.md)
     ├─ Sub-fase 3: Detalle → TAREAS (TAREA.md)
     │                        ├─ invoca /usecases (si hay lógica)
     │                        └─ invoca /screens (si hay UI)
     └─ Usuario aprueba todo → META estado: ACTIVA

FASE 4: Implementación (ciclo por tarea)
  dev_backend / dev_frontend
     ├─ Sub-estado: PENDING → CODING → CODE_COMPLETE
     ├─ Escribe: código + tests unitarios/integración
     └─ Pasa a: qa-tester

FASE 5: Testing
  qa-tester
     ├─ Sub-estado: CODE_COMPLETE → TESTING → TEST_PASSED / TEST_FAILED
     ├─ Ejecuta: suite completa
     ├─ Si PASA: genera manual con Playwright screenshots
     └─ Pasa a: mapper-writer (si pasa) o debugger (si falla)

[Si falla en tests — ciclo de debugging]
  debugger
     ├─ Sub-estado: TEST_FAILED → DEBUG_ANALYSIS → FIX_REQUIRED
     ├─ Produce: Diagnóstico de causa raíz + qué cambiar
     └─ Devuelve a: dev-backend/dev-frontend (vuelve a CODING)

[Si pasa en tests — ciclo de mapeo]
  mapper-writer
     ├─ Sub-estado: TEST_PASSED → MAPPED
     ├─ Documenta: código en bóveda, ADR, flujos
     └─ Pasa a: mapper-reader (validación)

  mapper-reader
     ├─ Sub-estado: MAPPED → COMPLETE (si todo coherente)
     │         o: MAPPED → FIX_REQUIRED (si divergencia)
     └─ Valida: coherencia código ↔ documentación

FASE 6: Validación de meta (cuando todas tareas COMPLETE)
  validator (rol 9, opcional pero recomendado)
     ├─ META estado: EN_VALIDACION
     ├─ Verifica: ácidas, seguridad, rendimiento, criterios ALCANCE
     └─ Resultado: VALIDADA (OK) o ACTIVA (rechaza)

FASE 7: Aprobación del usuario
  pm (`/board`)
     ├─ Presenta: criterios vs evidencia
     └─ Usuario aprueba → META estado: CERRADA
```

---

## Cómo instalar los agentes en un proyecto

En la raíz del proyecto, crear **8 carpetas** con `AGENT_CONFIG.md`:

```bash
mkdir -p .framework-bootstrapper .planner .dev-backend .dev-frontend .qa-tester .mapper-writer .mapper-reader .debugger

for role in framework-bootstrapper planner dev-backend dev-frontend qa-tester mapper-writer mapper-reader debugger; do
  cat > .$role/AGENT_CONFIG.md << 'EOF'
---
agente_app: <herramienta>
version: v0.1.0
proyecto: <nombre>
roles_declarados: [$role]
skills_activos: [<skills específicos del rol>]
mcps_activos: [codebase-memory, enquire-mcp]
modo_descubrimiento: local
---
# AGENT_CONFIG — $role
# [resto de configuración específica]
EOF
done
```

Luego, cada herramienta (Claude Code, OpenCode, etc.) se configura **solo con los roles que puede cumplir**:

```yaml
# .claude/AGENT_CONFIG.md
---
agente_app: claude-code
version: v0.1.0
proyecto: mi-proyecto
roles_declarados: [dev-backend, dev-frontend, debugger, mapper-writer, mapper-reader, planner]
skills_activos: [project-backend, project-frontend, project-debug, init-project, usecases, screens, obsidian]
mcps_activos: [codebase-memory, enquire-mcp]
---
```

```yaml
# .opencode/AGENT_CONFIG.md
---
agente_app: opencode
version: v0.1.0
proyecto: mi-proyecto
roles_declarados: [framework-bootstrapper, qa-tester]
skills_activos: [project-test, project-manual-doc, obsidian]
mcps_activos: [codebase-memory, enquire-mcp]
---
```

---

## Anti-patrones

- ❌ Un agente en **todos** los roles — especialización perdida.
- ❌ Roles sin skill precargado — el agente improvisa.
- ❌ `mapper_writer` entra en `TEST_FAILED` — mapea código roto.
- ❌ `debugger` escribe código — rompe la separación; devuelve al `dev_*`.
- ❌ `planner` no itera con usuario en cada sub-fase — plan no validado.
- ❌ `mapper-writer` mapea antes de que `mapper-reader` valide — documentación prematura.
- ❌ No registrar qué herramienta ocupa cada rol — pérdida de trazabilidad.
- ❌ Omitir el rol `validator` en metas de producción — sin validación previa a aprobación.

---

## Notas importantes

- **Este documento define 8 roles operacionales.** No incluye `validator` ni `pm` (`/board`), que están en [`Agent_Roles_And_Lifecycle.md`](Agent_Roles_And_Lifecycle.md).
- **Estados:** Todos los sub-estados de tarea y estados de meta están unificados en [`Unified_States_Standard.md`](Unified_States_Standard.md). Remite allá para transiciones, validez y matriz de roles por estado.
- **Unificación de planificación:** Los roles `initiator`, `planner` (fase 1) y `task-planner` (fase 2) ahora son **un único rol `planner`** con 3 sub-fases internas. Esto resuelve la duplicidad identificada en [`../ESTADOS_ANALYSIS.md`](../ESTADOS_ANALYSIS.md).

---

## Relacionado

- [`Unified_States_Standard.md`](Unified_States_Standard.md) — fuente canónica de todos los estados (tarea + meta)
- [`Agent_Configuration_Pattern.md`](Agent_Configuration_Pattern.md) — cómo configura cada agente su `AGENT_CONFIG.md`
- [`Agent_Roles_And_Lifecycle.md`](Agent_Roles_And_Lifecycle.md) — ciclo de vida general del proyecto (remite a este doc para roles operacionales)
- [`Agent_Onboarding_Standard.md`](Agent_Onboarding_Standard.md) — cómo un agente llega y se identifica
- [`../07_Documentation/Implementation_Log_Standard.md`](../07_Documentation/Implementation_Log_Standard.md) — zona de escritura compartida (remite a Unified_States_Standard.md)
- [`../ESTADOS_ANALYSIS.md`](../ESTADOS_ANALYSIS.md) — análisis de contradicciones que llevó a esta refactorización
