# Plantilla del skill `/obsidian` (fuente única)

Esta carpeta es la **fuente única** del skill `/obsidian`, el Experto y custodio de la bóveda
(ver [`../../09_AI/Documentation_Expert.md`](../../09_AI/Documentation_Expert.md)).

```
Obsidian_Skill_Template/
├── SKILL.md       ← el skill (100% Markdown, sin scripts)
├── reference.md   ← material de apoyo (mapa de la bóveda)
└── README.md      ← este archivo
```

## Instalación en un proyecto

Copia el contenido de esta carpeta a `.claude/skills/obsidian/` del proyecto:

```bash
mkdir -p .claude/skills/obsidian
cp <framework>/Templates/Obsidian_Skill_Template/SKILL.md     .claude/skills/obsidian/
cp <framework>/Templates/Obsidian_Skill_Template/reference.md .claude/skills/obsidian/
```

Tras esto, `/obsidian` queda disponible como skill invocable en ese proyecto.

## Mantenerlo "siempre actualizado"

La instalación es una **copia**; para que esté al día cuando el framework mejore el skill,
**re-sincroniza** desde esta plantilla:

- Si el framework se incorpora como **submódulo**: actualiza el submódulo y vuelve a copiar
  (o enlaza `.claude/skills/obsidian/` al submódulo).
- Si es **copia/vendoring**: vuelve a copiar esta carpeta sobre `.claude/skills/obsidian/`.

> Regla: **no edites el skill instalado** en el proyecto para "arreglarlo" localmente. Mejora la
> fuente (esta plantilla) y re-sincroniza, para que todos los proyectos hereden la mejora.

## Por qué solo Markdown
El skill no usa scripts: el Experto trabaja con sus herramientas de archivos (`Read`, `Grep`,
`Glob`, `Edit`, `Write`). Así evoluciona sin dependencias y la finalidad se mantiene.
