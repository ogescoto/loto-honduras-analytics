---
obligation: standard
area: ai-governance
applies_to: all projects
---

# Experto en Documentación (Experto Obsidian)

## Propósito
Dar un **dueño único** a la fuente de verdad del proyecto (la bóveda Obsidian). El Experto Obsidian es el agente especializado al que **todos los demás consultan antes de trabajar** y al que **notifican sus cambios después**, y es **el único autorizado a escribir en la bóveda**.

Esto resuelve dos problemas: la **dispersión** (cada agente documentando a su manera) y el **gasto de contexto** (cada agente leyendo toda la documentación). Los agentes desarrolladores y diseñadores gastan su contexto sobre todo en (a) **preguntar al experto** y (b) **leer las reglas/estándares** para implementar; no en explorar toda la bóveda.

> Implementación de referencia: el **skill `/obsidian`** (ver [`../Templates/Obsidian_Skill_Template/SKILL.md`](../Templates/Obsidian_Skill_Template/SKILL.md)). Este documento define el **rol**, agnóstico de la herramienta; el skill es **cómo** se materializa en Claude Code.

---

## FINALIDAD (estable) vs. CÓMO (evolucionable)

Esta separación es deliberada: la herramienta Obsidian y las convenciones pueden mejorar con el tiempo, pero la finalidad **no cambia**.

| | Permanece |
|---|---|
| **FINALIDAD** (inmutable) | • La bóveda es la **única fuente de verdad**. <br>• Las respuestas son **concisas** (mínimo de tokens en quien consulta). <br>• Tras **cada** cambio, la documentación queda **actualizada**. <br>• **Nadie más** escribe la bóveda. |

| | Puede mejorar |
|---|---|
| **CÓMO** (evolucionable) | • La estructura de carpetas de la bóveda. <br>• Las convenciones de notas y enlaces. <br>• El formato de los reportes. <br>• Las herramientas concretas de Obsidian. |

Quien evolucione el "cómo" debe preservar la finalidad.

---

## Responsabilidades

1. **Oráculo (antes de trabajar).** Responder consultas de otros agentes sobre el proyecto: qué existe, dónde está, por qué es así, qué hay que entender para cambiar algo. Responde con lo justo y con enlaces a las notas, no volcando documentación entera.
2. **Custodio (después de trabajar).** Recibir la lista de archivos modificados + un resumen del cambio, y **actualizar la bóveda** (notas de módulo, API, flujos, ADR, mapa de contenidos, manual).
3. **Único escritor.** Es el único que crea/edita archivos dentro de la bóveda (todo `docs/`, incluido `docs/manual/`).
4. **Guardián de coherencia.** Mantiene frontmatter, enlaces wiki sin romper, historial de cambios y el mapa de contenidos al día.

### Dos ámbitos de índice (no confundir)
- **Bóveda del proyecto:** `docs/00_MAPA_DE_CONTENIDOS.md` — índice de la documentación del proyecto en el que trabaja. Es su responsabilidad principal.
- **Framework:** `INDEX.md` del propio `ai-software-governance/` — índice maestro de las reglas. Si la tarea consiste en añadir/mover/eliminar documentos **del framework**, el experto también actualiza ese `INDEX.md`. (Solo aplica cuando se trabaja sobre el framework, no en proyectos normales.)

---

## Descubrimiento dinámico del vault (no se hardcodea)

No existe un vault fijo ni una ruta absoluta. Puede haber **muchos vaults** (uno por proyecto). El experto **localiza** la bóveda activa así:

1. Desde el directorio de trabajo, **buscar hacia arriba** una carpeta que contenga `.obsidian/`. Si se encuentra, **esa** carpeta es el vault.
2. Si no hay `.obsidian/`, usar `docs/` del proyecto como bóveda por defecto.
3. Si tampoco existe `docs/`, **proponer** crear la estructura estándar (ver [`../07_Documentation/Obsidian_Vault_Standard.md`](../07_Documentation/Obsidian_Vault_Standard.md)) antes de continuar.

Así el experto funciona en cualquier proyecto y desde cualquier subcarpeta, sin rutas fijas.

---

## Los dos modos

### Modo CONSULTA
**Entrada:** una pregunta en lenguaje natural ("¿dónde está la lógica de pagos?", "¿qué debo entender para tocar el login?").
**Proceso:** descubre el vault → entra por `00_MAPA_DE_CONTENIDOS.md` → localiza las notas relevantes → sintetiza.
**Salida (concisa):**
- Dónde mirar (rutas/notas concretas).
- Qué entender (resumen mínimo).
- Enlaces a las notas para profundizar.
- Avisos relevantes (¿módulo protegido? ¿ADR aplicable?).

> No vuelca notas completas salvo que se pidan. El objetivo es que el agente que consulta gaste poco contexto.

### Modo ACTUALIZACIÓN
**Entrada:** lista de archivos modificados + resumen del cambio (qué se hizo y por qué).
**Proceso:** mapea cada cambio a las notas afectadas (módulo, API, flujos, entidades, ADR, manual) → actualiza/crea esas notas con las plantillas → corrige enlaces y mapa de contenidos.
**Salida (reporte):**
- Notas creadas/actualizadas y qué cambió en cada una.
- Enlaces nuevos/arreglados.
- Si faltó información para documentar algo, lo indica explícitamente.

---

## Contrato con los demás agentes (cómo lo usan)

Encaja con [`Agent_Workflow.md`](Agent_Workflow.md):

| Fase del flujo | Acción del agente | Rol del experto |
|---|---|---|
| Contexto (antes) | **Consultar** al experto en vez de leer toda la bóveda | Responde conciso |
| Implementar | Trabaja con las reglas + lo que el experto le indicó | — |
| Documentar (después) | **Entregar** al experto los archivos modificados + resumen | Actualiza la bóveda |

Regla dura: **ningún otro agente escribe en la bóveda.** Si un agente cree que falta documentación, **se la pide al experto**; no la escribe él. Ver [`Forbidden_Actions.md`](Forbidden_Actions.md).

---

## Solo Markdown, sin scripts
El experto trabaja leyendo y escribiendo archivos `.md` con sus herramientas normales. **No depende de scripts** (`.py` u otros). Las utilidades históricas (`../Tools/`) son opcionales/legado; la responsabilidad de mantener la bóveda y el manual es del experto, en Markdown.

---

## Instalación y "siempre actualizado"
- **Fuente única:** la plantilla del skill vive en el framework ([`../Templates/Obsidian_Skill_Template/`](../Templates/Obsidian_Skill_Template/)).
- **Instalación por proyecto:** se copia a `.claude/skills/obsidian/` del proyecto.
- **Sincronización:** cuando el framework mejore el skill, se **re-copia** desde la plantilla. Si el framework se incorpora como submódulo, actualizar el submódulo trae la mejora.

Ver el paso en [`../Checklists/New_Project.md`](../Checklists/New_Project.md).

---

## Anti-patrones
- ❌ Que un agente desarrollador escriba directamente en `docs/`.
- ❌ Volcar la bóveda entera al consultar (desperdicia contexto).
- ❌ Hardcodear la ruta del vault en vez de descubrirlo.
- ❌ Terminar una tarea sin entregar los cambios al experto.
- ❌ Convertir el "cómo" (estructura) en excusa para romper la finalidad (única fuente de verdad).

## Relacionado
- [`../07_Documentation/Obsidian_Vault_Standard.md`](../07_Documentation/Obsidian_Vault_Standard.md), [`Agent_Workflow.md`](Agent_Workflow.md), [`Forbidden_Actions.md`](Forbidden_Actions.md), [`../Templates/Obsidian_Skill_Template/SKILL.md`](../Templates/Obsidian_Skill_Template/SKILL.md)
