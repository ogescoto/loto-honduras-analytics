# Plantilla del skill `/screens` (fuente única)

Esta carpeta es la **fuente única** del skill `/screens`, el Arquitecto de Pantallas y
Navegación (ver [`../../09_AI/Screen_Architect.md`](../../09_AI/Screen_Architect.md)).

```
Screen_Skill_Template/
├── SKILL.md       ← el skill (100% Markdown, sin scripts)
├── reference.md   ← material de apoyo (plantilla canónica + ejemplo + tabla código→UI)
└── README.md      ← este archivo
```

## Qué hace

Traduce una matriz de casos de uso —o el código de UI existente— en un **mapa exhaustivo de
pantallas**. Cada ficha `SCR-*` declara ruta, actores, contrato de datos, **una fila por cada
control** con su validación, efecto, feedback y navegación, los cinco estados de la vista y el
mapa de navegación. Es **descriptivo**: no genera código ni escribe en la bóveda (las fichas se
entregan a `/obsidian` para persistirlas).

## Dónde encaja

```
/usecases  →  UC-CAJA-001 (negocio, agnóstico de tecnología)
                    ↓
/screens   →  SCR-CAJA-002 Apertura de caja
              (inventario de acciones, 5 estados, navegación)
                    ↓
              implementación de UI + tests E2E + manual de usuario
```

Es el eslabón que faltaba entre el **qué hace el negocio** y el **qué ve y toca el usuario**.
También convierte las reglas `Mandatory` de [`../../02_UI_UX/Design_Principles.md`](../../02_UI_UX/Design_Principles.md)
en algo **verificable**: la ficha es la evidencia de que se cumplen.

## Instalación en un proyecto

Copia el contenido de esta carpeta a `.claude/skills/screens/` del proyecto:

```bash
mkdir -p .claude/skills/screens
cp <framework>/Templates/Screen_Skill_Template/SKILL.md     .claude/skills/screens/
cp <framework>/Templates/Screen_Skill_Template/reference.md .claude/skills/screens/
```

Tras esto, `/screens` queda disponible como skill invocable en ese proyecto:

```
/screens UC-CAJA-001                    ← desde un caso de uso ya generado
/screens El cajero abre y cierra su turno de caja
/screens code src/pages/caja/           ← ingeniería inversa de pantallas existentes
```

## Mantenerlo "siempre actualizado"

La instalación es una **copia**; para que esté al día cuando el framework mejore el skill,
**re-sincroniza** desde esta plantilla:

Al **migrar el proyecto a una versión nueva del framework** (ver
[`../../00_Governance/Framework_Access_Standard.md`](../../00_Governance/Framework_Access_Standard.md)),
vuelve a copiar esta carpeta sobre `.claude/skills/screens/`.

> **Copia, no enlace.** Un skill es **ejecutable**: si cambiara bajo los pies de un agente a
> mitad de tarea, su comportamiento cambiaría sin aviso. La copia da control sobre **cuándo**
> se adopta la mejora — la misma lógica que un lockfile.

> Regla: **no edites el skill instalado** en el proyecto para "arreglarlo" localmente. Mejora
> la fuente (esta plantilla) y re-sincroniza, para que todos los proyectos hereden la mejora.

## Por qué solo Markdown
El skill no usa scripts: el arquitecto trabaja con herramientas de lectura (`Read`, `Grep`,
`Glob`) y, si existen, las herramientas de **lectura** del MCP de código. Así evoluciona sin
dependencias y la finalidad se mantiene.
