---
template: true
area: ai-governance
---

# Plantilla: `CLAUDE.md` del proyecto (puntero)

> **⚠️ Esta plantilla cambió.** El punto de entrada de los agentes ya **no** es `CLAUDE.md`,
> sino [`AGENTS.md`](AGENTS_Template.md) — un archivo único que leen **todas** las herramientas.
> `CLAUDE.md` pasa a ser un **puntero de una línea**.
>
> Norma: [`../gobernanza/Project_Context_Standard.md`](../gobernanza/Project_Context_Standard.md).

---

## Qué copiar

A `CLAUDE.md` en la raíz del proyecto:

```markdown
Lee `AGENTS.md` en la raíz. Es el punto de entrada único para todos los agentes.
```

Eso es todo. Lo mismo para las demás herramientas:

| Herramienta | Archivo | Contenido |
|---|---|---|
| Claude Code | `CLAUDE.md` | el puntero |
| Cursor | `.cursorrules` | el puntero |
| Copilot | `.github/copilot-instructions.md` | el puntero |
| OpenCode / Codex / Whale | leen `AGENTS.md` directamente | — |

---

## Por qué el cambio

| | Antes | Ahora |
|---|---|---|
| Fuentes de verdad | Una por herramienta | **Una sola** (`AGENTS.md`) |
| Riesgo de divergencia | Alto — se editan por separado | Ninguno |
| Herramienta nueva | Escribir otro archivo completo | Un puntero de una línea |
| Ruta al framework | **Hardcodeada** (`.governance/ai-software-governance/…`) | Declarada en `governance_path` y descubierta dinámicamente |

Ese último punto era un defecto real: la ruta literal solo funcionaba si el framework estaba
exactamente en `.governance/ai-software-governance/`. Fallaba con submódulo directo, con copia
en otra ubicación y con el framework compartido entre varios proyectos. Ahora la ruta se
declara **una vez** en `AGENTS.md` y, si falta, se descubre buscando `.governance-root`
(ver [`../gobernanza/Framework_Access_Standard.md`](../gobernanza/Framework_Access_Standard.md)).

---

## Dónde va ahora cada cosa

Lo que antes estaba en `CLAUDE.md` se reparte así:

| Contenido | Ahora vive en |
|---|---|
| Reglas no negociables, ruta al framework, orden de lectura | `AGENTS.md` |
| Propósito, visión, alcance del proyecto | `docs/00_Proyecto/` |
| Stack, módulos, decisiones vigentes | `docs/00_Proyecto/CONTEXTO_GLOBAL.md` |
| Identidad y capacidades de **tu** herramienta | `.<herramienta>/AGENT_CONTEXT.md` |

## Estructura resultante en un proyecto

```
mi-proyecto/
├── AGENTS.md                 ← punto de entrada único (normativo)
├── CLAUDE.md                 ← este puntero
├── .cursorrules              ← puntero
├── .aicodeprotect.yml
├── .governance/              ← el framework (submódulo anclado a un tag)
├── .claude/
│   ├── AGENT_CONTEXT.md      ← contrato de esta herramienta
│   └── AGENT_CONFIG.md       ← configuración local (subagentes, modelos)
├── docs/
│   ├── 00_Proyecto/          ← VISION · ALCANCE · CONTEXTO_GLOBAL
│   ├── 07_Implementacion/    ← ACTIVIDAD.md (zona de escritura compartida)
│   └── .obsidian/
└── src/
```

## Relacionado
- [`AGENTS_Template.md`](AGENTS_Template.md) — el punto de entrada real.
- [`Agent_Contract_Template.md`](Agent_Contract_Template.md) — el contrato por herramienta.
- [`Project_Context_Template/`](Project_Context_Template/) — `docs/00_Proyecto/`.
- [`../gobernanza/Framework_Access_Standard.md`](../gobernanza/Framework_Access_Standard.md) — descubrimiento y versionado.
- [`../Checklists/New_Project.md`](../Checklists/New_Project.md).
