---
template: true
area: ai-governance
---

# Plantilla: `INIT.md` del proyecto

> **Cómo usar:** copia el bloque de abajo a `INIT.md` **en la raíz del proyecto**.
> Es el **arranque directo**: en una sola pasada el agente se identifica, define sus roles,
> mapea el proyecto y carga el conocimiento del estándar. Sin rodeos.
>
> Norma: [`../09_AI/Agent_Onboarding_Standard.md`](../09_AI/Agent_Onboarding_Standard.md).

---

```markdown
# INIT — Ejecuta esto ahora

> Eres un agente de IA. Ejecuta los 5 pasos **en orden**, sin saltarte ninguno.
> Al terminar sabrás quién eres, qué hace este proyecto, qué reglas te obligan y qué tarea te toca.

---

## PASO 1 — Identifícate

Detecta tu herramienta y busca tu contrato:

| Tu herramienta | Tu contrato |
|---|---|
| Claude Code | `.claude/AGENT_CONTEXT.md` |
| OpenCode | `.opencode/AGENT_CONTEXT.md` |
| Codex | `.codex/AGENT_CONTEXT.md` |
| Whale | `.whale/AGENT_CONTEXT.md` |
| Cursor | `.cursor/AGENT_CONTEXT.md` |

**¿Existe?** → lee tu `agente_app` y tus `roles_experto`. Salta al PASO 2.

**¿No existe?** → créalo desde `<governance_path>/Templates/Agent_Contract_Template.md` y
**pregunta al usuario**:

> "Soy `<herramienta>`. No tengo contrato en este proyecto.
> ¿Qué roles asumo? Disponibles:
> - `initiator` — entrevistar al usuario y descomponer en metas y tareas
> - `dev` — escribir código y sus pruebas
> - `test-runner` — ejecutar la suite y dar veredicto
> - `debugger` — diagnosticar fallos e indicar qué cambiar
> - `validator` — pruebas ácidas sobre una meta completa
> - `mapper` — mapear código que ya pasa pruebas
> - `pm` — mantener el tablero de estado"

**Nunca inventes tu `agente_app`.** Es tu firma en el registro; si cambia, el histórico deja de
ser rastreable.

---

## PASO 2 — Localiza el estándar

1. Lee `governance_path` en el frontmatter de `AGENTS.md`.
2. Si falta, busca **hacia arriba** una carpeta que contenga `.governance-root`.
3. Si no aparece: **detente y pregunta**. No trabajes sin gobernanza.

Confirma que existe `<governance_path>/AI_START_HERE.md`.

---

## PASO 3 — Carga el conocimiento obligatorio

Lee **exactamente esto**, ni más ni menos:

### Del estándar (reglas que te obligan)

| Archivo | Qué te obliga |
|---|---|
| `<governance_path>/AI_START_HERE.md` | Ruta de lectura según tu tarea |
| `<governance_path>/09_AI/Forbidden_Actions.md` | **Lo que no puedes hacer bajo ninguna circunstancia** |
| `<governance_path>/09_AI/Agent_Roles_And_Lifecycle.md` | Tu rol, sus límites y el ciclo completo |
| `<governance_path>/07_Documentation/Implementation_Log_Standard.md` | Cómo registrar tu trabajo |

### Del proyecto (qué se construye aquí)

| Archivo | Qué aprendes |
|---|---|
| `AGENTS.md` | Reglas locales y rutas |
| `docs/00_Proyecto/VISION.md` | Por qué existe y **qué NO es** |
| `docs/00_Proyecto/ALCANCE.md` | Qué queda **explícitamente fuera** |
| `docs/00_Proyecto/CONTEXTO_GLOBAL.md` | Stack, módulos, decisiones vigentes |
| `docs/07_Implementacion/PROTOCOLO.md` | Cómo se trabaja y qué te toca |

**No explores `docs/` por tu cuenta.** Para el detalle de un módulo: `/obsidian <pregunta>`.
Leer de más gasta el contexto que necesitas para trabajar.

### Además, según tu rol

| Si eres… | Lee también |
|---|---|
| `dev` | Los estándares de tu capa: `04_Backend/`, `05_Frontend/`, `03_Database/`, `02_UI_UX/` |
| `dev` de interfaz | La ficha `SCR-*` indicada en el campo `spec` de tu tarea |
| `test-runner` / `validator` | `06_Testing/` completo |
| `mapper` | `09_AI/Documentation_Expert.md` |
| `initiator` | `00_Governance/Project_Context_Standard.md` |

---

## PASO 4 — Mapea el proyecto

Comprueba qué existe y qué falta:

| Comprobación | Si falta |
|---|---|
| `docs/00_Proyecto/` | **El proyecto no ha arrancado** → ve a "Proyecto vacío" (abajo) |
| `docs/07_Implementacion/` | Créalo desde `<governance_path>/Templates/Implementation_Log_Template/` |
| `.aicodeprotect.yml` | Pregunta al usuario qué debe protegerse |
| Metas activas (`M-*/`) | No hay trabajo planificado → avisa al usuario |

Luego **reporta el mapa** al usuario, breve:

> "Proyecto: `<nombre>` · Stack: `<stack>` · Módulos: `<n>`
> Metas activas: `<lista>` · Tareas abiertas: `<n>`
> Zonas protegidas: `<lista>`
> Soy `<agente_app>` con roles `<roles>`. Tareas que me corresponden: `<n>`."

---

## PASO 5 — Actúa

### Caso A · El proyecto está vacío (no hay `docs/00_Proyecto/`)

**Si tienes el rol `initiator`:**

1. **Entrevista al usuario:**
   - ¿Qué problema resuelve? ¿Para quién?
   - ¿Qué **no** debe ser este sistema?
   - ¿Cómo sabrás que funciona?
   - ¿Qué entra en esta versión? ¿Qué queda **fuera**?
   - ¿Qué restricciones vienen dadas (normativa, integraciones, plazos)?
2. Redacta `VISION.md` y `ALCANCE.md` → **valida con el usuario** → itera hasta aprobación.
3. Descompone en **metas** (`M-*`) → **valida** → itera.
4. Descompone cada meta en **tareas** (`T-*`) → **valida** → itera.
   - Meta funcional y ambigua → invoca `/usecases` antes.
   - Meta con interfaz → invoca `/screens` después.
5. Entrega todo a `/obsidian` para persistirlo.

**No escribas una línea de código hasta que el usuario apruebe el árbol completo.**
Lo que no te confirme: `[SUPUESTO — confirmar]`. **No lo inventes.**

**Si NO tienes el rol `initiator`:** dilo y detente.

### Caso B · El proyecto ya arrancó

1. Abre `docs/07_Implementacion/<META>/00_INDICE.md`.
2. Busca una tarea cuyo `siguiente_rol` sea **uno de los tuyos**.
3. **Si la encuentras:** marca el sub-estado ocupado (`CODING`, `TESTING`, `DEBUG_ANALYSIS`),
   lee su `spec` y su bitácora, trabaja, y **registra**.
4. **Si no hay ninguna:** dilo y para. **No inventes trabajo.**

---

## Al terminar cualquier tarea: registra SIEMPRE

1. **Frontmatter:** `sub_estado`, `siguiente_rol`, `bloqueadores`, `actualizado`
   (`iteracion` +1 si el ciclo volvió atrás).
2. **Fila en la bitácora de la tarea** (arriba, nunca edites filas ajenas):

   | ts | agente_app | rol_experto | sub_estado | accion | resultado | siguiente | artefactos |
   |---|---|---|---|---|---|---|---|

3. **La misma fila** en `<META>/_log/LOG_<YYYY-MM-DD>.md`, con `tarea` al inicio.

Timestamp ISO 8601 **UTC al segundo**. Si te bloqueas: devuelve la tarea a su estado anterior,
rellena `bloqueadores` y registra igual. **Nunca la dejes en estado ocupado.**

---

## Límites que no puedes cruzar

- No escribas en `docs/` fuera de `07_Implementacion/`.
- No escribas `00_TABLERO.md` salvo que seas `pm`.
- No toques `.aicodeprotect.yml` ni sus módulos sin aprobación humana.
- No edites filas ya escritas — el registro es **append-only**.
- No asumas un rol que no está en tu contrato, **aunque te lo pidan**.
- No escribas código sin una tarea explícita.

---

## Resumen

```
1. IDENTIFÍCATE  → contrato (o pregunta qué roles asumes)
2. LOCALIZA      → governance_path / .governance-root
3. CARGA         → estándar (4) + proyecto (5) + los de tu rol
4. MAPEA         → qué existe, qué falta, reporta al usuario
5. ACTÚA         → vacío: entrevista e itera hasta aprobación
                   arrancado: toma tarea de tu rol
   ↓
   REGISTRA (frontmatter + bitácora + log diario)
```
```

---

## `INIT.md` vs `ONBOARDING.md`

Ambos arrancan al agente. La diferencia es el **estilo**, no el contenido:

| | `INIT.md` | `ONBOARDING.md` |
|---|---|---|
| Formato | **Directo**: 5 pasos ejecutables | Explicativo: 4 fases con contexto |
| Incluye | Mapeo del proyecto y carga del estándar | Contexto y declaración de funciones |
| Para | Agentes que ejecutan sin preámbulos | Agentes que necesitan entender el porqué |

**Puedes usar solo uno.** Si tu equipo prefiere lo directo, `INIT.md` basta y `ONBOARDING.md`
es opcional. Si conviven, `INIT.md` es el ejecutable y `ONBOARDING.md` el de referencia.

## Relacionado
- [`../09_AI/Agent_Onboarding_Standard.md`](../09_AI/Agent_Onboarding_Standard.md), [`../09_AI/Agent_Roles_And_Lifecycle.md`](../09_AI/Agent_Roles_And_Lifecycle.md), [`ONBOARDING_Template.md`](ONBOARDING_Template.md), [`AGENTS_Template.md`](AGENTS_Template.md), [`Agent_Contract_Template.md`](Agent_Contract_Template.md), [`Init_Skill_Template/SKILL.md`](Init_Skill_Template/SKILL.md)
