# Receta: instalar y configurar los MCPs de código y bóveda (opcional/legado)

Recetas de instalación de `codebase-memory-mcp` y `@oomkapwn/enquire-mcp`. **Opcional/legado**:
no es el flujo principal. Referencia de la política retirada:
[`../../archivo/09_AI/Codebase_And_Vault_MCP.md`](../../archivo/09_AI/Codebase_And_Vault_MCP.md).

> 🧑‍💻 **Todo lo de esta página lo ejecuta el humano (o la CI)**, no un agente en medio de una
> tarea. Instalar servidores e indexar repositorios son operaciones de setup.

## 1. Instalación global (una vez por máquina)

```powershell
npm install -g codebase-memory-mcp
npm install -g @oomkapwn/enquire-mcp
```

## 2. Configuración por proyecto

**Opción A — archivo `.mcp.json`** (recomendada: queda versionada en el repo):
copia [`.mcp.json`](.mcp.json) a la raíz del proyecto y ajusta la ruta del vault
(por defecto `docs/`, según el descubrimiento dinámico del
[`estándar de bóveda`](../../gobernanza/Obsidian_Vault_Standard.md)).

**Opción B — registro con `claude mcp add`** (equivalente, por CLI):

```bash
# Grafo de código (lectura para todos los agentes)
claude mcp add codebase-memory -- codebase-memory-mcp

# Bóveda en modo CONSULTA (sin escritura) — instancia compartida
claude mcp add obsidian-vault -- enquire-mcp serve --vault ./docs
```

## 3. Escritura de la bóveda

La escritura de la bóveda la hace **`doc-mapper` con sus herramientas de archivos**
(`Edit`/`Write`). No se configura ninguna instancia MCP con `--enable-write`.

⚠️ **Nunca** añadas `--enable-write` a la instancia compartida del proyecto.

## 4. Indexado inicial del código

```bash
# Indexa el repositorio en el grafo (una vez, o al reestructurar el código)
codebase-memory-mcp index --path .
```

- Re-indexa cuando cambie sustancialmente la estructura (o automatízalo en CI).
- Los agentes comprueban frescura con `index_status`; **no** re-indexan por su cuenta.
- El índice es un artefacto **local**: no se versiona ni sale del entorno.

## 5. Verificación

```bash
claude mcp list        # ambos servidores conectados
```

Y en una sesión de agente: pedir `get_architecture` (codebase) y una `obsidian_search` de prueba
(bóveda). Confirmar que las tools de escritura **no** aparecen en la instancia compartida
(señal de que no lleva `--enable-write`).

## Relacionado
- [`README.md`](README.md) — mapa de esta carpeta
- [`../../gobernanza/Obsidian_Vault_Standard.md`](../../gobernanza/Obsidian_Vault_Standard.md) — escritor único (`doc-mapper`)
- [`../../Checklists/New_Project.md`](../../Checklists/New_Project.md) — dónde encaja en el arranque
