# Plantilla del skill `/usecases` (fuente única)

Esta carpeta es la **fuente única** del skill `/usecases`, el Arquitecto de Casos de Uso y
Escenarios (ver [`../../09_AI/UseCase_Architect.md`](../../09_AI/UseCase_Architect.md)).

```
UseCase_Skill_Template/
├── SKILL.md       ← el skill (100% Markdown, sin scripts)
├── reference.md   ← material de apoyo (plantilla canónica + ejemplo + tabla código→semántica)
└── README.md      ← este archivo
```

## Qué hace

Transforma cualquier entrada —descripción de negocio, historia de usuario ambigua o código
fuente existente— en **Casos de Uso "Totalmente Vestidos"**: camino feliz, ramificaciones
exhaustivas, excepciones y escenarios de reversión, en lenguaje de negocio. Es **descriptivo**:
no genera código ni escribe en la bóveda (los UC se entregan a `/obsidian` para persistirlos).

## Instalación en un proyecto

Copia el contenido de esta carpeta a `.claude/skills/usecases/` del proyecto:

```bash
mkdir -p .claude/skills/usecases
cp <framework>/Templates/UseCase_Skill_Template/SKILL.md     .claude/skills/usecases/
cp <framework>/Templates/UseCase_Skill_Template/reference.md .claude/skills/usecases/
```

Tras esto, `/usecases` queda disponible como skill invocable en ese proyecto:

```
/usecases El cajero cobra el tratamiento y a veces el paciente pide factura o se arrepiente
/usecases code src/payments/           ← ingeniería inversa de un módulo existente
```

## Mantenerlo "siempre actualizado"

La instalación es una **copia**; para que esté al día cuando el framework mejore el skill,
**re-sincroniza** desde esta plantilla:

Al **migrar el proyecto a una versión nueva del framework** (ver
[`../../00_Governance/Framework_Access_Standard.md`](../../00_Governance/Framework_Access_Standard.md)),
vuelve a copiar esta carpeta sobre `.claude/skills/usecases/`.

> **Copia, no enlace.** Un skill es **ejecutable**: si cambiara bajo los pies de un agente a
> mitad de tarea, su comportamiento cambiaría sin aviso. La copia da control sobre **cuándo**
> se adopta la mejora — la misma lógica que un lockfile.

> Regla: **no edites el skill instalado** en el proyecto para "arreglarlo" localmente. Mejora
> la fuente (esta plantilla) y re-sincroniza, para que todos los proyectos hereden la mejora.

## Por qué solo Markdown
El skill no usa scripts: el arquitecto trabaja con herramientas de lectura (`Read`, `Grep`,
`Glob`) y, si existen, las herramientas de **lectura** del MCP de código. Así evoluciona sin
dependencias y la finalidad se mantiene.
