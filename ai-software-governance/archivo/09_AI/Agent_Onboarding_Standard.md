---
obligation: mandatory
area: ai-governance
applies_to: all projects
---

# Iniciador del Agente (`ONBOARDING.md`)

## Propósito
Dar a **cualquier agente que llega por primera vez** un único archivo que responde, en orden y sin ambigüedad:

1. **¿Dónde estoy?** — qué proyecto es y bajo qué reglas opera.
2. **¿Quién soy?** — qué identidad y qué funciones tengo aquí.
3. **¿Qué debo leer?** — el contexto mínimo, ni más ni menos.
4. **¿Qué hago ahora?** — qué tarea me corresponde y cómo la registro.

Sin esto, cada herramienta improvisa su arranque: unas leen de más y gastan contexto, otras leen de menos y trabajan a ciegas. El iniciador **normaliza la entrada** sin imponer cómo trabaja cada una por dentro.

---

## Dónde vive y quién lo lee

En la **raíz del proyecto**, junto a `AGENTS.md`.

| Archivo | Responde | Cuándo se lee |
|---|---|---|
| `AGENTS.md` | Reglas y rutas del proyecto | Siempre, primero |
| **`INIT.md`** | **Arranque directo en 5 pasos** | **Al llegar** — es el ejecutable |
| `ONBOARDING.md` | Lo mismo, explicado en 4 fases | Opcional, para entender el porqué |
| `.<agente>/AGENT_CONTEXT.md` | Tu identidad concreta y capacidades | Cada sesión |

### `INIT.md` y `ONBOARDING.md`

Ambos arrancan al agente; cambia el **estilo**, no el contenido:

- **`INIT.md`** — directo: 5 pasos ejecutables, incluye el **mapeo del proyecto** y la **carga del conocimiento del estándar**. Es el recomendado.
- **`ONBOARDING.md`** — explicativo: 4 fases con el porqué de cada una.

**Con `INIT.md` basta.** Si conviven, `INIT.md` es el ejecutable y `ONBOARDING.md` la referencia.

`AGENTS.md` dice *qué está permitido*; `ONBOARDING.md` dice *cómo empiezas*. Separados porque el primero es normativo y estable, y el segundo es un procedimiento que puede afinarse sin tocar reglas.

---

## Las cuatro fases del arranque

### Fase 1 — Identificación
El agente declara **quién es** antes de leer nada más:

- Si existe `.<su-herramienta>/AGENT_CONTEXT.md` → esa es su identidad (`agente_app`, `roles_experto`).
- Si no existe → lo **crea** desde la plantilla, o **pregunta** al humano qué identidad usar.
- **Nunca inventa un `agente_app`** ni asume roles no declarados.

### Fase 2 — Contexto (lectura mínima)

**Si no existe `docs/00_Proyecto/`**, el proyecto no ha arrancado: el agente con rol `initiator` entrevista al usuario y construye el árbol visión → metas → tareas, validando en cada paso ([`Agent_Roles_And_Lifecycle.md`](Agent_Roles_And_Lifecycle.md)). Sin ese rol, lo reporta y se detiene.

Si ya arrancó, cuatro lecturas, en este orden, y **ninguna más** en el arranque:

| # | Archivo | Para qué |
|---|---|---|
| 1 | `docs/00_Proyecto/VISION.md` | Entender el porqué y **qué no es** el proyecto |
| 2 | `docs/00_Proyecto/ALCANCE.md` | Saber qué está **fuera** — no construir lo descartado |
| 3 | `docs/00_Proyecto/CONTEXTO_GLOBAL.md` | Qué existe hoy: stack, módulos, decisiones |
| 4 | `docs/07_Implementacion/PROTOCOLO.md` | Cómo se trabaja y qué tarea le toca |

> **No leer la bóveda entera.** Para detalle de un módulo se **consulta** al Experto (`/obsidian`), no se explora. Ver [`Documentation_Expert.md`](Documentation_Expert.md).

### Fase 3 — Declaración de funciones
El agente **declara al humano** qué puede hacer en este proyecto, según sus roles y sus skills instalados. No es una formalidad: hace explícito el reparto y evita que dos agentes asuman lo mismo.

### Fase 4 — Selección de tarea
Busca en `00_INDICE.md` una tarea cuyo `siguiente_rol` coincida con uno de sus roles. Si la encuentra, la toma poniendo el sub-estado ocupado. Si no hay ninguna, **lo dice y se detiene** — no inventa trabajo.

---

## Funciones: propias y compartidas

Un agente tiene funciones **según sus roles declarados**. Pero los roles no son exclusivos de una herramienta:

- **Varias herramientas pueden declarar el mismo rol.** Dos agentes con rol `dev` es normal; el `sub_estado` de cada tarea impide que se pisen (quien entra primero la marca ocupada).
- **Un agente puede ceder o asumir una función a petición.** Si el humano pide "ahora haz de debugger" y ese rol está en su contrato, lo asume. Si **no** está en su contrato, responde que no le corresponde y sugiere quién debería hacerlo.
- **La petición no crea capacidad.** Pedirle a una herramienta sin `mapper` que mapee no la habilita: primero se añade el rol a su contrato, con criterio.

> Regla operativa: **el contrato manda sobre la petición.** Un rol no declarado no se asume aunque se pida — se responde qué falta para poder asumirlo.

---

## Qué NO hace el iniciador

- **No sustituye a `AI_START_HERE.md`.** El iniciador es del **proyecto**; `AI_START_HERE.md` son las reglas **genéricas** del framework. El primero lleva al segundo.
- **No asigna trabajo.** Eso lo hace el `sub_estado` de cada tarea ([`../07_Documentation/Implementation_Log_Standard.md`](../07_Documentation/Implementation_Log_Standard.md)).
- **No duplica reglas.** Apunta a `AGENTS.md` y al framework; no los reescribe.

---

## Reglas

1. **El arranque es siempre el mismo**, sea cual sea la herramienta: identificarse → contexto → declarar funciones → tomar tarea.
2. **Lectura mínima en el arranque.** Cuatro archivos. El detalle se consulta al Experto cuando hace falta.
3. **Sin identidad no se trabaja.** Si no hay contrato y no se puede crear, se pregunta.
4. **Un rol no declarado no se asume**, aunque se pida.
5. **Si no hay tarea disponible, se reporta y se para.** No se inventa trabajo ni se toma una tarea ajena a los roles propios.

---

## Anti-patrones

- ❌ Empezar a trabajar sin haber leído `VISION.md` y `ALCANCE.md` (se construye lo descartado).
- ❌ Explorar la bóveda entera en el arranque en vez de consultar al Experto.
- ❌ Inventar un `agente_app` porque no había contrato.
- ❌ Asumir un rol solo porque el humano lo pidió, sin tenerlo en el contrato.
- ❌ Tomar una tarea cuyo `siguiente_rol` no coincide con los propios.
- ❌ Duplicar en `ONBOARDING.md` las reglas que ya están en `AGENTS.md` o en el framework.
- ❌ Inventar trabajo cuando no hay tarea disponible.

## Relacionado
- [`Agent_Roles_And_Lifecycle.md`](Agent_Roles_And_Lifecycle.md), [`Agent_Contract_Standard.md`](Agent_Contract_Standard.md), [`../00_Governance/Project_Context_Standard.md`](../00_Governance/Project_Context_Standard.md), [`../07_Documentation/Implementation_Log_Standard.md`](../07_Documentation/Implementation_Log_Standard.md), [`Agent_Workflow.md`](Agent_Workflow.md), [`../Templates/INIT_Template.md`](../Templates/INIT_Template.md), [`../Templates/ONBOARDING_Template.md`](../Templates/ONBOARDING_Template.md), [`../Templates/Init_Skill_Template/SKILL.md`](../Templates/Init_Skill_Template/SKILL.md)
