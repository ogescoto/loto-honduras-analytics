# Manual de Uso

Guía práctica del framework: cómo se adopta, cómo se arranca un proyecto y cómo trabaja el
día a día. Si buscas la **filosofía**, ve a [`GOVERNANCE.md`](GOVERNANCE.md); si buscas una
**regla concreta**, a [`INDEX.md`](INDEX.md).

---

## 1. Qué es esto en una frase

Un repositorio de reglas que se incorpora a tus proyectos para que **cualquier agente de IA**
—Claude Code, OpenCode, Codex, Whale, Cursor…— sepa qué puede hacer, qué no, en qué orden y
dejando qué rastro.

No contiene código de aplicación. Contiene el **acuerdo** bajo el que se escribe ese código.

---

## 2. Instalación en un proyecto

### 2.1 Incorporar el framework

```bash
git submodule add https://github.com/<org>/ai-software-governance .governance
cd .governance && git checkout v1.0.0 && cd ..
```

**Anclar siempre a un tag**, nunca a `main`: así el proyecto no recibe cambios sin decidirlo.
Otros modos (copia, framework hermano, paquete npm) en
[`00_Governance/Framework_Access_Standard.md`](00_Governance/Framework_Access_Standard.md).

### 2.2 Archivos en la raíz del proyecto

| Archivo | Desde | Para qué |
|---|---|---|
| `AGENTS.md` | [`Templates/AGENTS_Template.md`](Templates/AGENTS_Template.md) | Punto de entrada único. Declara `governance_path` y `governance_version` |
| `INIT.md` | [`Templates/INIT_Template.md`](Templates/INIT_Template.md) | Arranque en 5 pasos del agente que llega |
| `CLAUDE.md`, `.cursorrules` | — | Punteros de **una línea** a `AGENTS.md` |
| `.<herramienta>/AGENT_CONTEXT.md` | [`Templates/Agent_Contract_Template.md`](Templates/Agent_Contract_Template.md) | Identidad y roles de cada agente |
| `.aicodeprotect.yml` | [`Examples/.aicodeprotect.yml`](Examples/.aicodeprotect.yml) | Qué no se toca sin aprobación |

### 2.3 Carpetas en `docs/`

```
docs/
├── 00_Proyecto/          ← visión, alcance, contexto global
├── 01_Dominio/ … 06_UX_UI/
├── 07_Implementacion/    ← zona de escritura compartida
└── manual/
```

Plantillas: [`Templates/Project_Context_Template/`](Templates/Project_Context_Template/README.md)
y [`Templates/Implementation_Log_Template/`](Templates/Implementation_Log_Template/README.md).

### 2.4 Skills

Se **copian** a `.claude/skills/` (o equivalente). No se enlazan: un skill es ejecutable y no
debe cambiar bajo los pies de un agente a mitad de tarea.

| Skill | Qué hace |
|---|---|
| `/init-project` | Entrevista al usuario → visión, alcance, metas y tareas |
| `/usecases` | Requisitos o código → casos de uso `UC-*` |
| `/screens` | Casos de uso → fichas de pantalla `SCR-*` |
| `/obsidian` | Oráculo y único escritor de la bóveda |
| `/board` | Tablero de estado con diagramas |

Checklist completa: [`Checklists/New_Project.md`](Checklists/New_Project.md).

---

## 3. Arrancar un proyecto nuevo

```
Usuario: "quiero construir X"
   ↓
/init-project entrevista
   ↓
VISION + ALCANCE ──► ¿usuario aprueba? ──no──┐
   ↓ sí                                       │ itera
METAS ──────────────► ¿usuario aprueba? ──no──┤
   ↓ sí                                       │
TAREAS ─────────────► ¿usuario aprueba? ──no──┘
   ↓ sí
[recién aquí se escribe código]
```

**No se escribe una línea de código hasta que el usuario aprueba el árbol completo.**

Dos preguntas de la entrevista importan más que el resto:

- **"¿Qué NO debe ser este sistema?"** → va a `VISION.md`
- **"¿Qué queda fuera de esta versión?"** → va a `ALCANCE.md`

Son las que evitan que un agente con buen criterio construya algo que se decidió descartar.

---

## 4. El día a día

### 4.1 Cómo llega un agente

Lee `INIT.md` y ejecuta cinco pasos: se identifica → localiza el estándar → carga el
conocimiento obligatorio → mapea el proyecto → actúa.

No explora la bóveda: para el detalle de un módulo, pregunta a `/obsidian`.

### 4.2 Cómo se reparte el trabajo

**Nadie asigna nada.** Cada tarea tiene un `sub_estado` y ese estado decide qué rol entra:

| Estado | Entra | Deja en |
|---|---|---|
| `PENDING` | `dev` | `CODE_COMPLETE` |
| `CODE_COMPLETE` | `test-runner` | `TEST_PASSED` / `TEST_FAILED` |
| `TEST_FAILED` | `debugger` | `FIX_REQUIRED` |
| `FIX_REQUIRED` | `dev` | `CODE_COMPLETE` |
| `TEST_PASSED` | `mapper` | `MAPPED` |

Un agente llega, mira el estado, y sabe si le toca. Así se relevan herramientas que no se
conocen entre sí.

### 4.3 El ciclo hasta verde

```
dev → test-runner ──rojo──► debugger ──► dev ──► test-runner ──verde──► mapper
```

Sin límite de vueltas. El contador `iteracion` las registra y el `pm` avisa a partir de 3 —
es una señal, no un freno.

### 4.4 Los límites que hacen que funcione

| Rol | **No hace** |
|---|---|
| `dev` | No ejecuta la suite ni se declara verde |
| `test-runner` | No arregla nada |
| `debugger` | No escribe código |
| `validator` | No corrige: reporta |
| `mapper` | No mapea código en rojo |
| `pm` | No asigna trabajo ni desbloquea |

Un rol que hace el trabajo de otro rompe la cadena.

### 4.5 Registrar (obligatorio)

Al terminar, **tres escrituras**:

1. Frontmatter de la tarea: `sub_estado`, `siguiente_rol`, `bloqueadores`, `actualizado`.
2. Fila en la bitácora de la tarea.
3. La misma fila en el log diario.

```
| ts | agente_app | rol_experto | sub_estado | accion | resultado | siguiente | artefactos |
| 2026-08-07T16:20:47Z | claude-code | test-runner | TEST_FAILED | suite pagos | 2/14 rojas | debugger | tests/pagos.spec.ts:88 |
```

**Dos identidades siempre:** `agente_app` (la herramienta) y `rol_experto` (la especialidad).
Una herramienta trae varios expertos y ambos deben quedar trazados.

**Append-only:** se añaden filas, nunca se editan las existentes. Es lo que permite que varios
agentes escriban sin coordinarse.

---

## 5. Cerrar una meta

Cuando todas las tareas están en `MAPPED`/`COMPLETE`:

1. Entra el **`validator`**: pruebas ácidas sobre la meta completa, seguridad, rendimiento,
   cobertura y los criterios de `ALCANCE.md`. Si falla, devuelve tareas a `FIX_REQUIRED` y el
   ciclo reinicia.
2. Si pasa, el **`pm`** presenta al usuario los criterios con evidencia.
3. **El usuario aprueba o rechaza.**

> **Una meta no se cierra sola.** Ni el `pm` ni el `validator` pueden darla por lograda: solo
> el usuario, contra los criterios que él mismo aprobó al principio.

Estados de meta: `PLANIFICANDO` → `ACTIVA` → `EN_VALIDACION` → `VALIDADA` → `CERRADA`.

---

## 6. Quién escribe dónde

| Zona | Escribe | Naturaleza |
|---|---|---|
| `docs/00_Proyecto/`, `01_` … `06_`, `manual/` | **Solo `/obsidian`** | Conocimiento curado |
| **`docs/07_Implementacion/`** | **Todos los agentes** | Registro de ejecución |
| `docs/07_Implementacion/00_TABLERO.md` | **Solo `/board`** | Vista global |

Es la única excepción a la regla del único escritor, y está ahí para que el relevo asincrónico
sea posible ([ADR-0003](07_Documentation/ADR.md)).

---

## 7. Ver cómo va

```
/board            ← todas las metas
/board M-001      ← una meta
```

Produce `00_TABLERO.md` con estado por meta, alertas (ciclo excesivo, estancamiento, deuda de
mapeo, aprobación pendiente) y diagramas Mermaid.

Toda métrica sale de un **dato del registro**. Si no hay dato, no hay métrica.

---

## 8. Actualizar el framework

```bash
cd .governance
git fetch --tags
git checkout v0.3.0
```

Luego **vuelve a copiar los skills** a `.claude/skills/`.

Versionado: **MAJOR** si un ADR altera o retira una regla existente; **MINOR** si añade
política nueva; **PATCH** para correcciones. Antes de un MAJOR, lee su `MIGRATION.md`.

---

## 9. Errores frecuentes

| Error | Por qué falla |
|---|---|
| Empezar a codificar sin `docs/00_Proyecto/` | Nadie sabe para qué se construye |
| Dejar `ALCANCE.md` sin "fuera de alcance" | Un agente construirá lo que se descartó |
| Que el `dev` se declare verde | Nadie ejecutó las pruebas de verdad |
| Mapear código en rojo | Se documenta algo que no funciona |
| Editar filas de bitácora ajenas | Rompe la auditoría y el relevo |
| Anclar a `main` en vez de a un tag | El proyecto recibe cambios sin decidirlo |
| Cerrar una meta sin el usuario | Nadie verificó contra la intención original |
| Explorar toda la bóveda al arrancar | Se agota el contexto antes de trabajar |
| Duplicar reglas en `AGENTS.md` | Se desincronizan del framework |

---

## 10. Dónde seguir

| Necesitas | Ve a |
|---|---|
| La filosofía y el modelo de obligatoriedad | [`GOVERNANCE.md`](GOVERNANCE.md) |
| Buscar cualquier archivo | [`INDEX.md`](INDEX.md) |
| Las reglas por área | [`00_Governance/Policy_Index.md`](00_Governance/Policy_Index.md) |
| Los roles y el ciclo completo | [`09_AI/Agent_Roles_And_Lifecycle.md`](09_AI/Agent_Roles_And_Lifecycle.md) |
| El registro y sus sub-estados | [`07_Documentation/Implementation_Log_Standard.md`](07_Documentation/Implementation_Log_Standard.md) |
| Instalar en un proyecto | [`Checklists/New_Project.md`](Checklists/New_Project.md) |
| Por qué se decidió algo así | [`07_Documentation/ADR.md`](07_Documentation/ADR.md) |
| Un término que no entiendes | [`GLOSSARY.md`](GLOSSARY.md) |
