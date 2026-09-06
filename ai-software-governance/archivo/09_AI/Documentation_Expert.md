---
obligation: standard
area: ai-governance
applies_to: all projects
---

# Experto en Documentación y Mapeo (Experto Obsidian)

## Propósito
Dar un **dueño único** a la fuente de verdad del proyecto (la bóveda Obsidian). El Experto Obsidian es el agente especializado al que **todos los demás consultan antes de trabajar** y al que **notifican sus cambios después**, y es **el único autorizado a escribir en la bóveda**.

Es también el **mapeador** del proyecto: la fuente de verdad **contextual y ubicacional**. No solo custodia lo que la documentación dice; sabe **dónde vive cada cosa en el código real** y mantiene ambos alineados. Para ello puede apoyarse en dos servidores MCP —el grafo de código y el acceso a la bóveda— descritos en [`Codebase_And_Vault_MCP.md`](Codebase_And_Vault_MCP.md).

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
3. **Único escritor.** Es el único que crea/edita archivos dentro de la bóveda (todo `docs/`, incluido `docs/manual/`) — **con una excepción: `docs/07_Implementacion/`**, la zona de escritura compartida donde todos los agentes registran su trabajo. Ver [`../07_Documentation/Implementation_Log_Standard.md`](../07_Documentation/Implementation_Log_Standard.md).
4. **Guardián de coherencia.** Mantiene frontmatter, enlaces wiki sin romper, historial de cambios y el mapa de contenidos al día.
5. **Mapeador.** Mantiene la correspondencia entre la bóveda y el **código real**: qué módulo vive dónde, qué símbolos cambiaron, qué documentación quedó obsoleta. Si el código y la bóveda divergen, lo detecta y lo señala como defecto a resolver.
6. **Destilador del registro.** **Lee** `07_Implementacion/` para extraer lo que merece perdurar y llevarlo a la bóveda curada: decisiones → ADR (`02_Arquitectura/adr/`), flujos nuevos → `05_Procesos/`, módulos → `04_Modulos/`. **No escribe** en esa zona: el registro pertenece a quien ejecutó. Cuando una meta se cierra y se archiva, lo que debía perdurar ya vive en la bóveda.

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
**Proceso:** descubre el vault → entra por `00_MAPA_DE_CONTENIDOS.md` → localiza las notas relevantes → sintetiza. Con MCPs disponibles: `obsidian_search` (recuperación híbrida) para localizar notas con menos tokens, y `get_architecture`/`search_graph` para contrastar con el **código actual** cuando la pregunta es estructural.
**Salida (concisa):**
- Dónde mirar (rutas/notas concretas).
- Qué entender (resumen mínimo).
- Enlaces a las notas para profundizar.
- Avisos relevantes (¿módulo protegido? ¿ADR aplicable?).

> No vuelca notas completas salvo que se pidan. El objetivo es que el agente que consulta gaste poco contexto.

### Modo ACTUALIZACIÓN
**Entrada:** lista de archivos modificados + resumen del cambio (qué se hizo y por qué).
**Proceso:** mapea cada cambio a las notas afectadas (módulo, API, flujos, entidades, ADR, manual) → actualiza/crea esas notas con las plantillas → corrige enlaces y mapa de contenidos. Con MCPs disponibles, el mapeo es de precisión: `detect_changes` (diff → símbolos afectados con riesgo), `trace_path` (impacto en llamantes/dependientes), y `obsidian_get_backlinks`/`obsidian_stale_notes` (qué notas documentan esas zonas y cuáles quedaron obsoletas) — **antes** de escribir.
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

## Herramientas del experto (MCP, opcionales)

El experto puede apoyarse en dos servidores MCP — política completa y matriz de permisos en [`Codebase_And_Vault_MCP.md`](Codebase_And_Vault_MCP.md):

| Servidor | Para qué lo usa el experto |
|---|---|
| **codebase-mcp** (lectura) | Mapear: `detect_changes`, `trace_path`, `search_graph`, `get_architecture`, `get_code_snippet` — saber con precisión qué cambió y qué documentar |
| **obsidian-mcp** (lectura + `--enable-write`) | Consultar la bóveda con recuperación híbrida (`obsidian_search`, `obsidian_get_backlinks`, `obsidian_stale_notes`) y escribirla (`obsidian_create_note`, `obsidian_append_to_note`, `obsidian_frontmatter_set`…) |

Dos reglas duras:
- **`--enable-write` es exclusivo del experto.** Ningún otro agente obtiene las herramientas de escritura de la bóveda. Es la misma regla `mandatory` del único escritor, reforzada por configuración.
- **Degradación elegante:** si los MCP no están instalados, el experto opera al 100% con sus herramientas de archivos. Los MCP mejoran el flujo; no lo condicionan.

---

## Solo Markdown, sin scripts propios
El experto trabaja leyendo y escribiendo archivos `.md` con sus herramientas normales. **No depende de scripts propios** (`.py` u otros); puede apoyarse en servidores MCP externos como herramientas de lectura/escritura (sección anterior), siempre preservando la FINALIDAD. Las utilidades históricas (`../Tools/`) son opcionales/legado; la responsabilidad de mantener la bóveda y el manual es del experto, en Markdown.

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
- [`../07_Documentation/Obsidian_Vault_Standard.md`](../07_Documentation/Obsidian_Vault_Standard.md), [`Codebase_And_Vault_MCP.md`](Codebase_And_Vault_MCP.md), [`Agent_Workflow.md`](Agent_Workflow.md), [`Forbidden_Actions.md`](Forbidden_Actions.md), [`../Templates/Obsidian_Skill_Template/SKILL.md`](../Templates/Obsidian_Skill_Template/SKILL.md)
