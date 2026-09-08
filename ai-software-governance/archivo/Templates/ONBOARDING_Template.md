---
template: true
area: ai-governance
---

# Plantilla: `ONBOARDING.md` del proyecto

> **Cómo usar:** copia el bloque de abajo a `ONBOARDING.md` **en la raíz del proyecto**, junto
> a `AGENTS.md`. Rellena los `<...>`. Es lo que lee un agente **al llegar**.
>
> Norma: [`../09_AI/Agent_Onboarding_Standard.md`](../09_AI/Agent_Onboarding_Standard.md).

---

```markdown
# ONBOARDING — Empieza aquí

> Eres un agente de IA que va a trabajar en este proyecto. Este archivo te dice **quién eres
> aquí, qué debes leer y qué función vas a cumplir**. Sigue las cuatro fases en orden.
> No saltes ninguna.

---

## FASE 1 — Identifícate

**Antes de leer nada más**, averigua quién eres en este proyecto.

1. Busca el archivo de contrato de tu herramienta:
   `.claude/AGENT_CONTEXT.md` · `.opencode/AGENT_CONTEXT.md` · `.codex/AGENT_CONTEXT.md` ·
   `.whale/AGENT_CONTEXT.md` · `.cursor/AGENT_CONTEXT.md`

2. **Si existe:** ahí están tu `agente_app` y tus `roles_experto`. Esa es tu identidad.

3. **Si NO existe:** créalo desde `<governance_path>/Templates/Agent_Contract_Template.md`
   y **pregunta al humano**:
   > "No encuentro mi contrato. ¿Qué `agente_app` debo usar y qué roles asumo
   > (dev / test-runner / debugger / mapper / pm)?"

**Nunca inventes tu `agente_app`.** Es la firma con la que quedas registrado; si cambia entre
sesiones, el histórico deja de ser rastreable.

---

## FASE 2 — Empápate del contexto

### ⚠️ ¿El proyecto está vacío?

Si **no existe `docs/00_Proyecto/`**, este proyecto aún no ha arrancado. Si tu contrato incluye
el rol `initiator`, actívalo:

1. **Entrevista al usuario** — qué problema resuelve, para quién, qué **no** debe ser, qué
   entra en esta versión y qué queda **explícitamente fuera**.
2. Redacta `VISION.md` y `ALCANCE.md` → **valídalos con el usuario** e itera hasta su aprobación.
3. Descompone en **metas** (`M-*`) → **valida** → itera.
4. Descompone cada meta en **tareas** (`T-*`) → **valida** → itera.
   Si la meta es funcional y ambigua, invoca `/usecases` antes; si tiene interfaz, `/screens` después.
5. Entrega todo a `/obsidian` para persistirlo en la bóveda.

**No escribas una línea de código hasta que el usuario apruebe el árbol completo.**
Lo que no te confirme, márcalo `[SUPUESTO — confirmar]`; no lo inventes.

Si **no** tienes el rol `initiator`, dilo y detente:
> "El proyecto no tiene `docs/00_Proyecto/` y yo no tengo el rol `initiator`. Hace falta que
> un agente con ese rol entreviste al usuario antes de que yo pueda trabajar."

Ciclo completo: `<governance_path>/09_AI/Agent_Roles_And_Lifecycle.md`.

### Si el proyecto ya arrancó

Lee **estos cuatro archivos y ninguno más** en el arranque:

| # | Archivo | Qué sacas de ahí |
|---|---|---|
| 1 | `docs/00_Proyecto/VISION.md` | Por qué existe el proyecto y **qué NO es** |
| 2 | `docs/00_Proyecto/ALCANCE.md` | Qué queda **explícitamente fuera** de esta versión |
| 3 | `docs/00_Proyecto/CONTEXTO_GLOBAL.md` | Stack, módulos existentes, decisiones vigentes |
| 4 | `docs/07_Implementacion/PROTOCOLO.md` | Cómo se trabaja aquí y qué tarea te toca |

**No explores la bóveda (`docs/`) por tu cuenta.** Para el detalle de un módulo, **pregunta al
Experto de Documentación**: `/obsidian <tu pregunta>`. Leer de más gasta contexto que
necesitarás para trabajar.

> Las secciones **"Qué NO es"** (visión) y **"Fuera de alcance"** son las que más importan:
> evitan que construyas algo que se decidió no hacer.

---

## FASE 3 — Declara qué puedes hacer

Dile al humano, en pocas líneas, qué funciones traes a este proyecto:

> "Soy `<agente_app>`. Según mi contrato puedo actuar como `<roles>`.
> Tengo instalados los skills `<lista>` y los MCPs `<lista>`.
> Entiendo que este proyecto es `<una frase desde VISION.md>` y que **no** incluye
> `<algo desde ALCANCE.md → fuera de alcance>`."

Esto hace explícito el reparto y evita que dos agentes asuman lo mismo.

### Sobre funciones compartidas

- **Varios agentes pueden tener el mismo rol.** Es normal. El `sub_estado` de cada tarea evita
  que os piséis: quien entra primero la marca ocupada.
- **Si te piden un rol que SÍ está en tu contrato**, asúmelo.
- **Si te piden un rol que NO está en tu contrato**, respóndelo así:
  > "El rol `<X>` no está en mi contrato. Puedo asumirlo si lo añades a
  > `.<mi-herramienta>/AGENT_CONTEXT.md`, o lo puede tomar `<otra herramienta que sí lo tenga>`."

  **La petición no crea capacidad.** El contrato manda sobre la petición.

---

## FASE 4 — Toma una tarea

1. Abre `docs/07_Implementacion/<META>/00_INDICE.md`.
2. Busca una tarea cuyo **`siguiente_rol`** coincida con **uno de tus roles**.
3. **Si la encuentras:**
   - Abre la tarea `T-<NNN>_*.md`.
   - Lee su **frontmatter** (estado, bloqueadores, y `spec` → la ficha `SCR-*` o el caso de uso
     con el detalle funcional).
   - Lee su **bitácora** — qué se intentó antes, para no repetir un camino ya fallido.
   - **Marca el sub-estado ocupado** (`CODING`, `TESTING`, `DEBUG_ANALYSIS`) para que nadie
     más entre.
   - Trabaja.
   - **Registra** (ver abajo).
4. **Si NO hay ninguna tarea para tus roles:** dilo y **detente**.
   > "No hay tareas pendientes para mis roles (`<roles>`). Las tareas abiertas esperan a
   > `<roles que faltan>`."

   **No inventes trabajo ni tomes una tarea que no te corresponde.**

---

## Al terminar: registra SIEMPRE (tres escrituras)

1. **Frontmatter de la tarea:** `sub_estado`, `siguiente_rol`, `bloqueadores`, `actualizado`
   (y `iteracion` +1 si el ciclo volvió atrás).
2. **Fila en la bitácora de la tarea**, arriba del todo — nunca edites filas existentes.
3. **La misma fila** en `<META>/_log/LOG_<YYYY-MM-DD>.md`, con la columna `tarea` al inicio.

Timestamp ISO 8601 **UTC al segundo**: `2026-08-07T16:20:47Z`.

**Si te bloqueas:** devuelve la tarea a su estado anterior, rellena `bloqueadores` y registra
igualmente. **No la dejes en un estado ocupado** — nadie podría entrar.

---

## Límites que no puedes cruzar

- **No escribas en `docs/`** fuera de `07_Implementacion/`. El resto lo escribe solo el Experto.
- **No escribas `00_TABLERO.md`** salvo que seas el Project Manager.
- **No toques** los módulos de `.aicodeprotect.yml` sin aprobación humana.
- **No edites filas** ya escritas en ninguna bitácora — el registro es append-only.
- **No asumas** un rol que no está en tu contrato.
- **No escribas código sin una tarea explícita.**

Reglas completas: `AGENTS.md` y `<governance_path>/AI_START_HERE.md`.

---

## Resumen del arranque

```
1. IDENTIFÍCATE   → .<tu-herramienta>/AGENT_CONTEXT.md  (o pregunta)
2. CONTEXTO       → ¿existe docs/00_Proyecto/?
                    NO → modo initiator: entrevista → metas → tareas
                         (validando con el usuario en cada paso)
                    SÍ → VISION · ALCANCE · CONTEXTO_GLOBAL · PROTOCOLO
3. DECLARA        → qué roles traes y qué entendiste del proyecto
4. TOMA TAREA     → busca tu siguiente_rol en 00_INDICE.md
                    (si no hay: dilo y para)
   ↓
   TRABAJA → REGISTRA (frontmatter + bitácora + log diario)
   ↓
   ¿Meta completa? → validator → aprobación del usuario → CERRADA
```
```

---

## Por qué un iniciador aparte de `AGENTS.md`

| | `AGENTS.md` | `ONBOARDING.md` |
|---|---|---|
| Naturaleza | **Normativo** — qué está permitido | **Procedimiento** — cómo empiezas |
| Estabilidad | Estable | Se afina con la experiencia |
| Se lee | Siempre | Al llegar o al retomar |

Separarlos permite mejorar el arranque sin tocar reglas, y mantener `AGENTS.md` corto.

## Relacionado
- [`../09_AI/Agent_Onboarding_Standard.md`](../09_AI/Agent_Onboarding_Standard.md) — la norma.
- [`AGENTS_Template.md`](AGENTS_Template.md) — el punto de entrada normativo.
- [`Agent_Contract_Template.md`](Agent_Contract_Template.md) — el contrato por herramienta.
- [`Project_Context_Template/`](Project_Context_Template/README.md) — `docs/00_Proyecto/`.
- [`Implementation_Log_Template/PROTOCOLO.md`](Implementation_Log_Template/PROTOCOLO.md) — enrutamiento por sub-estado.
