---
template: true
area: ai-governance
---

# Plantilla: CLAUDE.md del proyecto

> **Cómo usar:** copia el bloque de abajo a un archivo **`CLAUDE.md` en la raíz del proyecto en desarrollo** (no dentro del framework). Rellena los campos `<...>`. Este archivo es lo PRIMERO que lee un agente; debe ser corto y **redirigir al framework**, no duplicarlo.
>
> Nombres equivalentes según la herramienta: `CLAUDE.md` (Claude Code), `AGENTS.md`, `.cursorrules` (Cursor), `.github/copilot-instructions.md` (Copilot). Puedes mantener uno y enlazar los demás a él.

---

```markdown
# CLAUDE.md — Instrucciones para agentes de IA

Este proyecto se rige por el **AI Software Governance Framework**.

## ⚠️ Antes de hacer NADA
Lee primero, siempre, el punto de entrada del framework:
👉 `.governance/ai-software-governance/AI_START_HERE.md`

Allí está la ruta de lectura según tu tarea (creación / modificación / documentación),
los niveles de obligatoriedad y las reglas de oro.

## Sobre este proyecto
- **Nombre:** <nombre-del-proyecto>
- **Propósito:** <qué problema resuelve, 1-2 frases>
- **Stack:** <lenguaje / framework / BD / servicios externos>
- **Estado:** <en desarrollo / producción>

## Dónde está cada cosa
- **Reglas (framework):** `.governance/ai-software-governance/`
- **Documentación / fuente de verdad (bóveda):** `docs/` — **NO la leas/escribas tú directamente**. Pregunta al Experto Obsidian: `/obsidian <consulta>` (antes) y `/obsidian update <archivos> -- <resumen>` (después).
- **Módulos protegidos:** `.aicodeprotect.yml` (raíz)
- **Variables de entorno:** `.env.example`
- **Comandos del proyecto:** <Makefile / package.json> — `<dev>`, `<test>`, `<migrate>`, `<seed-dev/test>`

## Reglas no negociables (resumen — el detalle está en el framework)
1. **No escribas código sin una tarea explícita.**
2. **No modifiques módulos protegidos** (`.aicodeprotect.yml`) sin aprobación humana.
3. **Toda entidad/caso de uso nuevo lleva seeds `dev_` y `test_`.**
4. **No dejes el repo con tests en rojo.**
5. **Ningún secreto en el código.**
6. **No escribas en `docs/`.** Consulta al Experto Obsidian (`/obsidian`) antes y entrégale los cambios después; él es el único que mantiene la fuente de verdad.

## Flujo de trabajo
Sigue `.governance/ai-software-governance/09_AI/Agent_Workflow.md`
y cierra con la checklist correspondiente de `.governance/ai-software-governance/Checklists/`.

## Notas específicas de este proyecto
- <excepciones aprobadas, particularidades del stack, decisiones locales…>
- <enlaza ADRs relevantes: docs/02_Arquitectura/adr/…>
```

---

## Por qué este archivo va en el proyecto y no en el framework

| | Framework (`ai-software-governance/`) | Proyecto (`CLAUDE.md`) |
|---|---|---|
| Contenido | Reglas **genéricas y reutilizables** | Contexto **específico** de esta app |
| Cambia entre proyectos | No | Sí |
| Punto de entrada del agente | `AI_START_HERE.md` (genérico) | `CLAUDE.md` (concreto → redirige al framework) |

Meter instrucciones de un proyecto dentro del framework contaminaría algo que debe servir a **todos** los proyectos por igual. Por eso el `CLAUDE.md` vive en la raíz del proyecto y solo **apunta** al framework.

## Estructura resultante en un proyecto

```
mi-proyecto/
├── CLAUDE.md                 ← generado desde esta plantilla
├── .aicodeprotect.yml        ← desde Examples/.aicodeprotect.yml
├── .env.example              ← desde Examples/env.example
├── .claude/
│   └── skills/obsidian/      ← skill /obsidian (desde Templates/Obsidian_Skill_Template/)
├── .governance/
│   └── ai-software-governance/   ← el framework (submódulo o copia)
├── docs/                     ← bóveda Obsidian del proyecto (contiene .obsidian/)
│   └── .obsidian/
└── src/
```

## Relacionado
- [`../AI_START_HERE.md`](../AI_START_HERE.md) — a donde redirige el CLAUDE.md.
- [`../Checklists/New_Project.md`](../Checklists/New_Project.md) — incluye crear el CLAUDE.md e instalar `/obsidian`.
- [`../09_AI/Documentation_Expert.md`](../09_AI/Documentation_Expert.md) — el Experto Obsidian.
- [`../09_AI/Agent_Workflow.md`](../09_AI/Agent_Workflow.md), [`../09_AI/Prompt_Rules.md`](../09_AI/Prompt_Rules.md)
