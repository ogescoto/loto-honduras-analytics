# Plantilla del skill `/board` (fuente única)

Esta carpeta es la **fuente única** del skill `/board`, el Project Manager de Implementación
(ver [`../../09_AI/Project_Manager.md`](../../09_AI/Project_Manager.md)).

```
PM_Skill_Template/
├── SKILL.md       ← el skill (100% Markdown, sin scripts)
├── reference.md   ← paleta, definiciones Mermaid y fórmulas de alerta
└── README.md      ← este archivo
```

## Qué hace

Lee todo el registro de `docs/07_Implementacion/` y regenera `00_TABLERO.md`: estado agregado
por meta, alertas derivadas del registro y diagramas Mermaid (mapa de estado, línea de tiempo,
iteraciones).

Es **observador**: no asigna trabajo, no desbloquea, no edita tareas. El enrutamiento lo hace
el `sub_estado` de cada tarea — el PM solo lo refleja.

## Dónde encaja

```
agentes escriben en T-*.md y _log/   (append-only, asincrónico)
                 ↓
/board lee todo y agrega
                 ↓
00_TABLERO.md    (única vista global; solo el PM lo escribe)
```

Simetría con el Experto Obsidian: uno es el único escritor de la bóveda curada, el otro del
tablero.

## Instalación en un proyecto

```bash
mkdir -p .claude/skills/board
cp <framework>/Templates/PM_Skill_Template/SKILL.md     .claude/skills/board/
cp <framework>/Templates/PM_Skill_Template/reference.md .claude/skills/board/
```

Uso:

```
/board            ← todas las metas activas
/board M-001      ← solo esa meta
```

Requiere que exista `docs/07_Implementacion/` (ver
[`../Implementation_Log_Template/README.md`](../Implementation_Log_Template/README.md)).

## Mantenerlo "siempre actualizado"

La instalación es una **copia**; vuelve a copiar esta carpeta al **migrar el proyecto a una
versión nueva del framework** (ver
[`../../00_Governance/Framework_Access_Standard.md`](../../00_Governance/Framework_Access_Standard.md)).
No edites el skill instalado para "arreglarlo" localmente: mejora la fuente y re-copia, para
que todos los proyectos hereden la mejora.

> **Copia, no enlace.** Un skill es **ejecutable**: si cambiara bajo los pies de un agente a
> mitad de tarea, su comportamiento cambiaría sin aviso.

## Por qué solo Markdown
El PM trabaja con herramientas de lectura (`Read`, `Grep`, `Glob`) y escribe un único archivo.
Sin scripts ni dependencias.
