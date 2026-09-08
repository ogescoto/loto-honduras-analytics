---
obligation: standard
area: ai-governance
applies_to: all projects
---

# MCPs de Código y Bóveda (codebase + obsidian)

## Propósito
Dar a los agentes —y sobre todo al **Experto en Documentación y Mapeo** ([`Documentation_Expert.md`](Documentation_Expert.md))— herramientas de **precisión** para entender el código y la documentación, sin alterar la regla fundamental: **la bóveda tiene un único escritor**.

Se integran dos servidores MCP complementarios:

| Servidor | Paquete | Qué aporta | Papel |
|---|---|---|---|
| **codebase-mcp** | `codebase-memory-mcp` | Grafo del código real (tree-sitter): símbolos, llamadas, dependencias, arquitectura, impacto de un diff | Mapa del **código tal cual es** |
| **obsidian-mcp** | `@oomkapwn/enquire-mcp` | Acceso a la bóveda Obsidian con recuperación híbrida (BM25 + embeddings), backlinks, frontmatter, detección de notas obsoletas | Acceso a la **verdad conceptual** (la bóveda) |

Se complementan: el grafo dice **qué es** el código; la bóveda dice **qué significa y por qué**. El Experto usa ambos para que nunca diverjan.

> Los MCP son **potenciadores, no requisitos**. Ver [Degradación elegante](#degradación-elegante-mandatory).

---

## Matriz de permisos por rol (Mandatory)

| Capacidad | Agente genérico (dev/diseñador) | Experto Obsidian |
|---|---|---|
| **codebase-mcp — lectura**: `search_graph`, `trace_path`, `detect_changes`, `get_architecture`, `get_code_snippet`, `search_code`, `query_graph`, `get_graph_schema`, `index_status`, `list_projects` | ✅ | ✅ |
| **codebase-mcp — escritura/estado**: `index_repository`, `delete_project`, `ingest_traces` | ❌ (operación de setup humano/CI) | ❌ (ídem) |
| **codebase-mcp — `manage_adr`** | ❌ **prohibido** | ❌ **prohibido** |
| **obsidian-mcp — lectura**: `obsidian_search`, `obsidian_read_note`, `obsidian_list_notes`, `obsidian_get_backlinks`, `obsidian_frontmatter_get`, `obsidian_context_pack`, `obsidian_stale_notes`, `obsidian_lint_wiki`, `obsidian_get_recent_edits`… | ✅ (consulta) | ✅ |
| **obsidian-mcp — escritura** (requiere `--enable-write`): `obsidian_create_note`, `obsidian_append_to_note`, `obsidian_frontmatter_set`, `obsidian_rename_note`, `obsidian_replace_in_notes`, `obsidian_archive_note` | ❌ **nunca** | ✅ **exclusivo** |

### La regla de oro, reforzada por configuración
`enquire-mcp` es **read-only por defecto**: sus herramientas de escritura solo existen si el servidor se lanza con `--enable-write`. Por tanto:

1. La instancia de obsidian-mcp **del proyecto** (la que usan los agentes genéricos para consultar) se configura **sin** `--enable-write`. Ver plantilla [`../Templates/mcp/.mcp.json`](../Templates/mcp/.mcp.json).
2. Solo el **Experto Obsidian** opera con `--enable-write`. Nadie más. Esto convierte la regla `mandatory` de "único escritor" ([`../07_Documentation/Obsidian_Vault_Standard.md`](../07_Documentation/Obsidian_Vault_Standard.md), [`Forbidden_Actions.md`](Forbidden_Actions.md)) en una garantía **técnica**, no solo disciplinaria.

---

## Fuente de verdad de ADR (Mandatory)
Los ADR viven **únicamente** en la bóveda: `docs/02_Arquitectura/adr/NNNN-titulo.md` (ver [`../07_Documentation/ADR.md`](../07_Documentation/ADR.md)), escritos por el Experto con la plantilla del framework.

La herramienta `manage_adr` de codebase-mcp **no se usa**: mantendría un segundo almacén de ADR dentro del grafo y duplicaría la fuente de verdad. Un ADR con dos casas no es una decisión, es una discrepancia esperando a ocurrir.

---

## Indexado del código
- `index_repository` es una **operación de setup**: se ejecuta una vez al incorporar el proyecto (paso en [`../Checklists/New_Project.md`](../Checklists/New_Project.md)) y se re-ejecuta cuando el humano o la CI lo decidan. **No** la dispara un agente en medio de una tarea.
- Antes de fiarse del grafo, el agente comprueba su frescura con `index_status`. Un grafo desactualizado se **reporta**, no se re-indexa por iniciativa propia.
- El índice es un **artefacto local**: no se versiona, no sale del entorno y no debe contener secretos (el código que indexa tampoco debería, ver [`../08_DevOps/Secrets_Management.md`](../08_DevOps/Secrets_Management.md)).

---

## Cómo los usa el Experto (mapear → documentar)

### En modo ACTUALIZACIÓN
Antes de escribir una sola nota:
1. `detect_changes` — mapea el git diff a **símbolos afectados** con clasificación de riesgo.
2. `trace_path` / `search_graph` — quién llama a lo que cambió y qué depende de ello.
3. `obsidian_get_backlinks` + `obsidian_stale_notes` — qué notas documentan esas zonas y cuáles quedaron obsoletas.
4. Recién entonces **escribe** (con `--enable-write` o con sus herramientas de archivos), con precisión de grafo en vez de intuición.

### En modo CONSULTA
- `obsidian_search` / `obsidian_context_pack` — recuperación híbrida sobre la bóveda: respuesta más certera con menos tokens que navegar notas a mano.
- `get_architecture` / `search_graph` — cuando la pregunta es "¿cómo está montado esto realmente?", responde con datos del **código actual**, y contrasta con lo que dice la bóveda. Si divergen, lo señala: esa discrepancia es un defecto a resolver.

El detalle operativo vive en el skill: [`../Templates/Obsidian_Skill_Template/SKILL.md`](../Templates/Obsidian_Skill_Template/SKILL.md).

### Qué gana el agente genérico
En la fase de **Contexto** ([`Agent_Workflow.md`](Agent_Workflow.md)), además de consultar al Experto, puede usar las herramientas de **lectura** de codebase-mcp para medir el impacto de lo que va a tocar (`trace_path`, `detect_changes`). Analizar el código es una **capacidad**, no un rol nuevo: no le autoriza a escribir documentación ni a saltarse la consulta al Experto.

---

## Degradación elegante (Mandatory)
Si los MCP **no están instalados o configurados** en un proyecto:
- El Experto sigue operando al 100% con sus herramientas de archivos (`Read`, `Grep`, `Glob`, `Edit`, `Write`).
- Ningún flujo del framework puede **depender** de que los MCP existan; solo pueden **mejorarlo**.
- El agente detecta la ausencia y continúa; no se detiene ni exige la instalación (puede sugerirla).

---

## Instalación y configuración
- Plantillas y recetas en [`../Templates/mcp/`](../Templates/mcp/README.md): `.mcp.json` del proyecto (ambos servidores, obsidian **sin** write) e `install.md` (registro con `claude mcp add`, indexado inicial, variante `--enable-write` del Experto).
- La ruta del vault en la configuración sigue el **descubrimiento dinámico** del estándar: por defecto `docs/` del proyecto (ver [`../07_Documentation/Obsidian_Vault_Standard.md`](../07_Documentation/Obsidian_Vault_Standard.md)).
- Higiene: los servidores corren **localmente**; ningún agente envía código o notas a servicios externos no autorizados ([`Forbidden_Actions.md`](Forbidden_Actions.md) §4 y §8).

---

## Anti-patrones
- ❌ Configurar obsidian-mcp con `--enable-write` en la instancia compartida del proyecto (cualquier agente podría escribir la bóveda).
- ❌ Usar `manage_adr` de codebase-mcp (segunda fuente de verdad de ADR).
- ❌ Que un agente re-indexe (`index_repository`) por su cuenta en medio de una tarea.
- ❌ Diseñar un flujo que **falla** si los MCP no están (rompe la degradación elegante).
- ❌ Tratar el grafo como fuente de verdad conceptual: el grafo describe el código; el **porqué** vive en la bóveda.
- ❌ Duplicar en notas lo que el grafo ya responde (listas de funciones, árboles de llamadas): la bóveda documenta significado, no inventarios.

## Relacionado
- [`Documentation_Expert.md`](Documentation_Expert.md), [`Agent_Workflow.md`](Agent_Workflow.md), [`Forbidden_Actions.md`](Forbidden_Actions.md)
- [`../07_Documentation/Obsidian_Vault_Standard.md`](../07_Documentation/Obsidian_Vault_Standard.md), [`../07_Documentation/ADR.md`](../07_Documentation/ADR.md)
- [`../Templates/mcp/README.md`](../Templates/mcp/README.md), [`../Templates/Obsidian_Skill_Template/SKILL.md`](../Templates/Obsidian_Skill_Template/SKILL.md)
