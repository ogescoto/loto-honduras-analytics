# Plantillas MCP: codebase + bóveda Obsidian (opcional/legado)

Configuración de los dos servidores MCP que potencian a los agentes y a `doc-mapper`.
**Opcional/legado:** no es el flujo principal del framework. Referencia de la política retirada:
[`../../archivo/09_AI/Codebase_And_Vault_MCP.md`](../../archivo/09_AI/Codebase_And_Vault_MCP.md).

| Archivo | Destino en el proyecto | Qué es |
|---|---|---|
| [`.mcp.json`](.mcp.json) | `.mcp.json` (raíz del proyecto) | Config MCP del proyecto: `codebase-memory` + `obsidian-vault` en **modo lectura** |
| [`install.md`](install.md) | — (receta, no se copia) | Instalación global, registro con `claude mcp add`, indexado inicial y variante con escritura |

## La diferencia crítica: lectura vs `--enable-write`

`enquire-mcp` (obsidian-vault) es **read-only por defecto**. Sus herramientas de escritura
**solo existen** si el servidor se lanza con `--enable-write`.

- La entrada `obsidian-vault` de [`.mcp.json`](.mcp.json) va **sin** `--enable-write`: es la
  instancia compartida de consulta para cualquier agente.
- La escritura de la bóveda la hace **`doc-mapper` con sus herramientas de archivos** (`Edit`/`Write`),
  no vía MCP. No hace falta ninguna instancia con `--enable-write`.

⚠️ Nunca añadas `--enable-write` a la instancia compartida del proyecto: equivaldría a dar
permiso de escritura sobre la fuente de verdad a todos los agentes.

## Instalación resumida

1. Instala los paquetes globalmente (una vez por máquina): ver [`install.md`](install.md).
2. Copia [`.mcp.json`](.mcp.json) a la raíz del proyecto y ajusta la ruta del vault
   (por defecto `docs/`).
3. Indexa el código una vez (`index_repository`) — operación de setup humano/CI, no del agente.
4. Los MCP son **potenciadores, no requisitos**: sin ellos, el trabajo sigue igual con las
   herramientas de archivos (degradación elegante).

## Relacionado
- [`../../gobernanza/Obsidian_Vault_Standard.md`](../../gobernanza/Obsidian_Vault_Standard.md) — bóveda y escritor único (`doc-mapper`)
- [`../../Checklists/New_Project.md`](../../Checklists/New_Project.md) — paso de incorporación
