---
obligation: standard
area: ai-governance
applies_to: all projects
---

# Contrato del Agente (`.<agente>/AGENT_CONTEXT.md`)

## Propósito
Dar a **cada herramienta** un archivo propio y permanente que responde a: *"¿quién soy yo en este proyecto, qué subagentes puedo ejecutar y cómo me firmo?"*.

Es el **ancla** del agente: lo relee siempre, sin depender de recordar nada entre sesiones ni de que alguien se lo explique.

Resuelve un problema concreto del trabajo multi-agente: la tabla de actividad exige saber **qué herramienta** registra cada tarea, pero **nada le decía a una herramienta cuáles son sus subagentes y su identidad**. Sin eso, cada agente se nombra a su manera y la trazabilidad se rompe.

---

## Dónde vive

Un archivo por herramienta, en su carpeta de configuración:

```
.claude/AGENT_CONTEXT.md
.opencode/AGENT_CONTEXT.md
.codex/AGENT_CONTEXT.md
.whale/AGENT_CONTEXT.md
```

**Mismo nombre y misma estructura en todas.** Lo que cambia es el contenido: los subagentes disponibles y las capacidades sí difieren entre herramientas.

### Por qué uno por herramienta y no uno compartido

Porque la respuesta a *"¿quién soy y qué puedo hacer?"* **depende de la herramienta**. OpenCode no tiene los mismos subagentes configurados que Claude Code, ni los mismos modelos. Un archivo compartido tendría que ser condicional —"si eres X, entonces…"— y eso es peor que N archivos claros.

Lo común (reglas, contexto del proyecto) ya vive en `AGENTS.md` y en la bóveda. Este archivo solo cubre lo específico.

---

## Qué contiene

### 1. Identidad declarada

Cómo se firma esta herramienta en la tabla de actividad:

```yaml
agente_app: opencode
subagentes: [doc-mapper, doc-reader, dev-backend, dev-frontend, tester, activity-manager]
idioma_respuesta: es
```

- **`agente_app`** — el valor exacto que va en la columna del registro. En minúsculas, sin espacios, estable en el tiempo.
- **`subagentes`** — qué subagentes del catálogo puede ejecutar esta herramienta (no tomes tareas fuera de su scope). Ver [`Subagents.md`](Subagents.md).
- **`idioma_respuesta`** — idioma en el que respondes siempre, hable el usuario como hable.

### 2. Orden de lectura obligatorio

Los cinco pasos de [`Project_Context_Standard.md`](Project_Context_Standard.md), con las rutas ya resueltas para este proyecto.

### 3. Límites

Qué subagentes puede ejecutar y qué no debe tocar nunca (módulos protegidos, escritura curada de `docs/`, filas ya escritas de la actividad — **append-only**).

### 4. Cómo registra

Al empezar y terminar una tarea, actualiza su fila en `docs/07_Implementacion/ACTIVIDAD.md` (tabla `META | TAREA | ESTADO | FECHA_INI | FECHA_FIN`), con el `agente_app` ya rellenado para que no haya duda. Norma en [`Activity_Tracking.md`](Activity_Tracking.md).

### 5. Capacidades de la herramienta

Modelos disponibles (barato/capaz/pensante), subagentes instalados y sus particularidades (rutas, permisos, limitaciones conocidas).

Plantilla: [`../Templates/Agent_Contract_Template.md`](../Templates/Agent_Contract_Template.md).

---

## Relación con el registro de actividad

Este archivo es lo que hace **operativo** el registro:

```
| META | TAREA | ESTADO | FECHA_INI | FECHA_FIN |
```

- `agente_app` sale literalmente del contrato de la herramienta.
- El alcance de cada tarea se asigna a un subagente del catálogo que la herramienta pueda ejecutar.

Sin contrato, un agente inventa su nombre y el registro deja de ser trazable — dos filas de la misma herramienta con nombres distintos parecen dos agentes.

---

## Reglas

1. **`agente_app` es estable.** No cambia entre sesiones ni versiones de la herramienta. Si cambia, el histórico deja de ser rastreable.
2. **Un subagente no declarado no se ejecuta.** Si el contrato no lista `tester`, esa herramienta no hace pruebas.
3. **El contrato no duplica reglas.** Apunta al framework y a `AGENTS.md`; no los reescribe.
4. **Se actualiza al instalar o quitar subagentes/skills/MCPs**, para que refleje capacidades reales.
5. **Si el contrato no existe**, el agente lo crea desde la plantilla antes de trabajar, o pregunta al humano qué identidad debe usar.

---

## Anti-patrones

- ❌ Trabajar sin contrato y firmar el registro con un nombre inventado.
- ❌ Cambiar el `agente_app` entre sesiones (rompe la trazabilidad histórica).
- ❌ Ejecutar un subagente no declarado en el contrato.
- ❌ Duplicar en el contrato las reglas que ya están en el framework.
- ❌ Un contrato que dice tener subagentes, skills o MCPs que no están configurados.
- ❌ Mantener el contrato de una herramienta que ya no se usa en el proyecto.

## Relacionado
- [`Project_Context_Standard.md`](Project_Context_Standard.md), [`Framework_Access_Standard.md`](Framework_Access_Standard.md), [`Activity_Tracking.md`](Activity_Tracking.md), [`Subagents.md`](Subagents.md), [`Agent_Workflow.md`](Agent_Workflow.md), [`../Templates/Agent_Contract_Template.md`](../Templates/Agent_Contract_Template.md)
