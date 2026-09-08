---
template: true
area: governance
---

# Plantilla: `AGENTS.md` del proyecto

> **Cómo usar:** copia el bloque de abajo a `AGENTS.md` **en la raíz del proyecto** (no dentro del framework). Rellena los `<...>`.
>
> Luego crea los **punteros** de cada herramienta (`CLAUDE.md`, `.cursorrules`, `.github/copilot-instructions.md`) con una sola línea que redirija aquí — ver el final de este archivo.
>
> Este archivo **redirige; no duplica** las reglas del framework. Si crece más de ~50 líneas, algo se está duplicando.

---

```markdown
---
governance_path: .governance
governance_version: v1.0.0
---

# AGENTS.md — Punto de entrada para agentes de IA

Este proyecto se rige por el **AI Software Governance Framework**.
Este archivo es la entrada única para **cualquier** herramienta (Claude Code, OpenCode,
Codex, Whale, Cursor, Copilot…).

## ⚠️ Antes de hacer NADA

**¿Es tu primera vez aquí o retomas trabajo?** → Si el proyecto **aún no tiene
`docs/00_Proyecto/`**, inicia la **asistencia inicial** (`<governance_path>/gobernanza/Project_Start.md`):
entrevista al usuario y produce visión, alcance y contexto antes de codificar.
Si ya estás orientado, lee el `AGENTS_CONTEXT` de tu herramienta y la tabla de actividad.

El orden de lectura es:

1. **Este archivo** — dónde estás y qué no puedes hacer.
2. **`.<tu-herramienta>/AGENT_CONTEXT.md`** — quién eres, cómo te firmas, qué subagentes ejecutas.
   (`.claude/`, `.opencode/`, `.codex/`…)
3. **`docs/00_Proyecto/CONTEXTO_GLOBAL.md`** — qué es este sistema hoy.
4. **`docs/07_Implementacion/ACTIVIDAD.md`** — qué hay en curso y qué tarea te toca.
5. **`<governance_path>/AI_START_HERE.md`** — las reglas del framework.

Si no encuentras el framework en `governance_path`, busca hacia arriba una carpeta con
`.governance-root`. Si aun así no aparece: **detente y pregunta**. No trabajes sin gobernanza.

## Sobre este proyecto

- **Nombre:** <nombre-del-proyecto>
- **Qué es:** <una o dos frases>
- **Estado:** <en desarrollo | producción>
- **Detalle completo:** `docs/00_Proyecto/` (visión, alcance, contexto global)

## Reglas no negociables (el detalle está en el framework)

1. **No escribas código sin una tarea explícita.**
2. **No modifiques módulos protegidos** (`.aicodeprotect.yml`) sin aprobación humana.
3. **No escribas en `docs/` — salvo en `docs/07_Implementacion/`**, la zona de escritura
   compartida. El resto de la bóveda la escribe solo `doc-mapper`.
4. **Registra tu trabajo** en `docs/07_Implementacion/ACTIVIDAD.md`
   (`META | TAREA | ESTADO | FECHA_INI | FECHA_FIN`) al empezar y terminar.
5. **Toda entidad/caso de uso nuevo lleva seeds `dev_` y `test_`.**
6. **No dejes el repo con tests en rojo.**
7. **Ningún secreto en el código.**

## Dónde está cada cosa

| Qué | Dónde |
|---|---|
| Reglas del framework | `<governance_path>/` |
| Visión, alcance y contexto | `docs/00_Proyecto/` |
| Documentación curada (bóveda) | `docs/` — consulta las notas directamente o vía `doc-reader` |
| Registro de trabajo en curso | `docs/07_Implementacion/ACTIVIDAD.md` |
| Módulos protegidos | `.aicodeprotect.yml` |
| Comandos | <Makefile / package.json> — `<dev>`, `<test>`, `<seed-dev>` |

## Flujo de trabajo

`<governance_path>/gobernanza/Agent_Workflow.md`, y cierra con la checklist correspondiente
de `<governance_path>/Checklists/`.

## Notas específicas de este proyecto

- <excepciones aprobadas, particularidades del stack, decisiones locales>
- <ADRs relevantes: docs/02_Arquitectura/adr/…>
```

---

## Punteros por herramienta

Crea cada uno con **una sola línea**. No dupliques contenido: se desincroniza.

**`CLAUDE.md`**
```markdown
Lee `AGENTS.md` en la raíz. Es el punto de entrada único para todos los agentes.
```

**`.cursorrules`**
```
Lee AGENTS.md en la raíz. Es el punto de entrada único para todos los agentes.
```

**`.github/copilot-instructions.md`**
```markdown
Lee `AGENTS.md` en la raíz. Es el punto de entrada único para todos los agentes.
```

## Por qué una entrada única

| | Antes (un archivo por herramienta) | Ahora (`AGENTS.md` + punteros) |
|---|---|---|
| Fuentes de verdad | N (una por herramienta) | 1 |
| Riesgo de divergencia | Alto — se editan por separado | Ninguno |
| Herramienta nueva | Escribir otro archivo completo | Añadir un puntero de una línea |

## Relacionado
- [`../gobernanza/Project_Context_Standard.md`](../gobernanza/Project_Context_Standard.md) — la norma.
- [`../gobernanza/Framework_Access_Standard.md`](../gobernanza/Framework_Access_Standard.md) — cómo se descubre el framework.
- [`Agent_Contract_Template.md`](Agent_Contract_Template.md) — el contrato por herramienta.
- [`Project_Context_Template/`](Project_Context_Template/) — `docs/00_Proyecto/`.
- [`../Checklists/New_Project.md`](../Checklists/New_Project.md).
