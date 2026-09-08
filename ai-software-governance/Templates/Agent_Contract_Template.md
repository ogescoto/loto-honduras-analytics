---
template: true
area: ai-governance
---

# Plantilla: `AGENT_CONTEXT.md` por herramienta

> **Cómo usar:** copia el bloque de abajo a `.<herramienta>/AGENT_CONTEXT.md` del proyecto —
> `.claude/`, `.opencode/`, `.codex/`, `.whale/`… Una copia por herramienta que trabaje en el
> proyecto, cada una con **su** identidad y **sus** capacidades reales.
> Subagentes: [`../gobernanza/Subagents.md`](../gobernanza/Subagents.md).

---

```markdown
---
agente_app: <opencode | claude-code | codex | whale | cursor>
subagentes: [doc-mapper, doc-reader, dev-backend, dev-frontend, tester, activity-manager]
idioma_respuesta: <idioma del usuario>
---

# AGENT_CONTEXT — <nombre de la herramienta>

Este archivo es tu **ancla**. Reléelo al empezar: no dependas de recordar nada.

## 1. Quién eres en este proyecto

- **`agente_app`:** `<valor>` — te firmas **siempre** así en el registro.
- **Subagentes que puedes ejecutar:** `<lista>` — no tomes tareas fuera de su scope.

## 2. Qué leer antes de trabajar

1. `AGENTS.md` (raíz) — reglas y ruta al framework.
2. **Este archivo.**
3. `<governance_path>/AI_START_HERE.md` — mapa del framework.
4. `docs/00_Proyecto/CONTEXTO_GLOBAL.md` — qué es el sistema hoy (o el `Project_Start` si no existe).
5. `docs/07_Implementacion/ACTIVIDAD.md` — tabla `META | TAREA | ESTADO | FECHA_INI | FECHA_FIN`.

## 3. Cómo trabajas

- Eres un **coordinador delgado**: delega, no resuelvas todo inline.
- **Modo cavernícola:** razonamiento interno mínimo; respuesta completa.
- **Idioma:** respondes en el idioma del usuario.
- Sigue [`<governance_path>/gobernanza/Agent_Workflow.md`] — el ciclo en 8 pasos.

## 4. Qué NO puedes tocar

- `docs/` fuera de lo acordado (la escritura curada la hace `doc-mapper`).
- Módulos listados en `.aicodeprotect.yml` sin aprobación humana.
- Filas ya escritas de la tabla de actividad o bitácora — **append-only**.

## 5. Cómo registras al terminar

Actualiza la fila de tu tarea en `docs/07_Implementacion/ACTIVIDAD.md`:

| META | TAREA | ESTADO | FECHA_INI | FECHA_FIN |
|---|---|---|---|---|
| M-001 Autenticación | T-001 Login | HECHA | 2026-08-15 | 2026-08-15 |

`FECHA_INI` al empezar; `FECHA_FIN` al terminar. Estados: `PENDIENTE`, `EN_CURSO`, `HECHA`, `BLOQUEADA`.
Formato de fecha: `YYYY-MM-DD`. Fechas en UTC al día (o con hora `T…Z` si hay precisión).

## 6. Tus capacidades en este proyecto

- **Subagentes instalados:** `<lista de los que esta herramienta puede ejecutar>`
- **Modelos disponibles:** `<barato / capaz / pensante>`
- **Skills del proyecto que puedes invocar:** `<lista, si los hay; vacío si el proyecto no tiene skills>`
- **Particularidades:** `<limitaciones conocidas, rutas propias, permisos>`

> Mantén esta sección **fiel a la realidad**: si dice que tienes un subagente que no está
> configurado, tomarás decisiones sobre capacidades que no existen.
```

---

## Relacionado

- [`../gobernanza/Subagents.md`](../gobernanza/Subagents.md) — catálogo.
- [`../Templates/Subagent_Template.md`](Subagent_Template.md) — ficha por subagente.
- [`../Templates/AGENT_CONFIG_Template.md`](AGENT_CONFIG_Template.md) — configuración local.
- [`../Templates/AGENTS_Template.md`](AGENTS_Template.md) — el punto de entrada.
