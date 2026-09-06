---
obligation: standard
area: ai-governance
applies_to: all projects
---

# Patrón de Configuración Local de Agentes

## Propósito

Definir **cómo se configura cada agente en su carpeta local** del proyecto, de modo que:

1. La **identidad y capacidades** quedan declaradas en un archivo frontmatter legible.
2. Los **skills precargados** se asignan explícitamente a cada agente.
3. La **configuración es enriquecible** por el implementador sin romper el estándar.
4. Todo es **local, versionado y reproducible**.

---

## Estructura por herramienta

Cada herramienta tiene una carpeta en la raíz del proyecto:

```
proyecto/
├── .claude/
│   ├── AGENT_CONFIG.md         ← configuración de Claude Code
│   ├── skills/
│   │   ├── init-project/       ← skills precargados (copias)
│   │   ├── usecases/
│   │   ├── screens/
│   │   ├── obsidian/
│   │   └── board/
│   └── mcp.json                ← (opcional) MCP servers
│
├── .opencode/
│   ├── AGENT_CONFIG.md
│   └── skills/ …
│
├── .codex/
│   ├── AGENT_CONFIG.md
│   └── skills/ …
│
└── … (más herramientas)
```

**Nota:** `.claude/AGENT_CONTEXT.md` (del estándar) sigue existiendo para la identidad; `AGENT_CONFIG.md` amplía con configuración local.

---

## Archivo de configuración: `AGENT_CONFIG.md`

Cada herramienta tiene un `AGENT_CONFIG.md` en su carpeta. Estructura:

```markdown
---
# FRONTMATTER (metadatos canónicos)
agente_app: <herramienta>
version: <v0.1.0>
proyecto: <nombre-del-proyecto>
roles_declarados: [initiator, dev, test-runner, debugger, validator, mapper]
skills_activos: [init-project, usecases, screens, obsidian, board]
mcps_activos: [codebase-memory, enquire-mcp]
modo_descubrimiento: local | remoto | hibrido
---

# AGENT_CONFIG — <herramienta>

## Identidad

- **Aplicación:** `<herramienta>` (el agente_app)
- **Versión del agente:** `<v0.x.x>`
- **Proyecto:** `<nombre>`
- **Fecha de instalación:** `<YYYY-MM-DD>`

## Roles asignados

Roles que **este agente puede asumir** en este proyecto:

| Rol | Sub-estados que toma | Justificación |
|---|---|---|
| `initiator` | `PENDING` (proyecto vacío) | Entrevista y descomposición |
| `dev` | `PENDING`, `FIX_REQUIRED` | Escritura de código |
| `test-runner` | `CODE_COMPLETE` | Ejecución de pruebas |

> Si falta un rol que necesitas, decláralo aquí y actualiza el contrato en `AGENT_CONTEXT.md`.

## Skills precargados

Cada skill es una **copia** en `skills/` que este agente **puede invocar**. No se enlazan; se copian.

| Skill | Ruta local | Última actualización | Estado |
|---|---|---|---|
| `/init-project` | `skills/init-project/SKILL.md` | 2026-08-13 | ✅ activo |
| `/usecases` | `skills/usecases/SKILL.md` | 2026-08-13 | ✅ activo |
| `/screens` | `skills/screens/SKILL.md` | 2026-08-13 | ✅ activo |
| `/obsidian` | `skills/obsidian/SKILL.md` | 2026-08-13 | ✅ activo |
| `/board` | `skills/board/SKILL.md` | 2026-08-13 | ✅ activo |

**Cómo invocar:** `/nombre-del-skill <argumento>` (dentro del proyecto).

## Configuración específica de la herramienta

Personalización que el implementador añade **sin romper el estándar**:

### Claude Code

```yaml
# Configuración opcional del agente
modelos_disponibles:
  - claude-opus-5
  - claude-sonnet-5
  - claude-haiku-4.5

mcp_servers:
  codebase-memory:
    url: localhost:3000
    read_only: false
  enquire-mcp:
    url: localhost:3001
    read_only: true

context_window: 200000
cache_ttl: 3600  # segundos
```

### OpenCode

```yaml
# OpenCode-específico
max_iterations: 10
sandbox_mode: true
approval_required_for:
  - protected_modules
  - .aicodeprotect.yml changes
```

### Codex

```yaml
# Codex-específico
api_key: ${CODEX_API_KEY}
endpoint: https://codex.internal
fallback_to: claude-code
```

## MCPs (Model Context Protocol)

Servidores MCP que proporciona este agente:

| MCP | Tipo | Qué ofrece |
|---|---|---|
| `codebase-memory` | read-write | Búsqueda y comprensión del código |
| `enquire-mcp` | read-only | Consultas a la bóveda Obsidian |

Configuración en `mcp.json` (opcional, al lado de `AGENT_CONFIG.md`).

```json
{
  "mcps": [
    {
      "name": "codebase-memory",
      "type": "read-write",
      "url": "stdio",
      "command": "node mcp-server-codebase.js"
    },
    {
      "name": "enquire-mcp",
      "type": "read-only",
      "url": "stdio",
      "command": "node mcp-server-obsidian.js"
    }
  ]
}
```

## Modo de descubrimiento

Cómo este agente localiza el framework:

| Modo | Cómo funciona |
|---|---|
| **local** | Lee `governance_path` de `AGENTS.md` y va directamente a `.governance/` |
| **remoto** | Busca `.governance-root` hacia arriba en el árbol |
| **híbrido** | Intenta local; si falla, busca remoto |

Modo actual: `<local | remoto | hibrido>`.

## Quirks y limitaciones conocidas

| Limitación | Impacto | Workaround |
|---|---|---|
| <…> | <…> | <…> |

Ejemplo: "Claude Code no tiene acceso a ejecutar tests en paralelo" → "Ejecuta tests secuenciales; el `/board` reporta tiempo aumentado".

## Sincronización

Cuándo y cómo se actualiza esta configuración:

- **Skills:** vuelven a copiarse al migrar de versión del framework (`git submodule update`).
- **Roles:** se revisan al cambiar de proyecto o versión del agente.
- **MCPs:** se reinician si cambia `mcp.json`.

Última sincronización: `<timestamp>`.

## Enriquecimiento personalizado

**El implementador puede añadir secciones aquí** sin romper el estándar. Ejemplos:

- Comportamiento esperado en caso de error.
- Patrones de prompt específicos de esta herramienta.
- Integración con herramientas internas.
- Métricas de seguimiento personalizadas.

**Regla:** no cambiar el frontmatter canónico ni las secciones del estándar; solo añadir secciones nuevas al final.

---

## Plantilla: `AGENT_CONFIG_Template.md`

Copia esto a `.<herramienta>/AGENT_CONFIG.md` para cada agente:

```markdown
---
agente_app: <herramienta>
version: <v0.1.0>
proyecto: <nombre-proyecto>
roles_declarados: []
skills_activos: [init-project, usecases, screens, obsidian, board]
mcps_activos: []
modo_descubrimiento: local
---

# AGENT_CONFIG — <herramienta>

## Identidad

- **Aplicación:** <…>
- **Versión del agente:** <…>
- **Proyecto:** <…>
- **Fecha de instalación:** <YYYY-MM-DD>

## Roles asignados

<tabla de roles>

## Skills precargados

<tabla de skills>

## Configuración específica

<configuración de la herramienta>

## MCPs

<lista de MCPs>

## Modo de descubrimiento

<local | remoto | hibrido>

## Quirks y limitaciones

<tabla de limitaciones conocidas>

## Sincronización

Última: <timestamp>

## Enriquecimiento personalizado

<secciones que el implementador agregue>
```

---

## Ciclo de vida de la configuración

### 1. Instalación inicial

```bash
# Copia el framework
git submodule add <url> .governance

# Crea la carpeta de cada herramienta
mkdir -p .claude .opencode .codex

# Copia plantilla de configuración
cp .governance/Templates/AGENT_CONFIG_Template.md .claude/AGENT_CONFIG.md
cp .governance/Templates/AGENT_CONFIG_Template.md .opencode/AGENT_CONFIG.md
# … repetir

# Rellena frontmatter y configuración específica manualmente
# (el implementador personaliza para cada herramienta)

# Copia los skills
mkdir -p .claude/skills
cp -r .governance/Templates/Init_Skill_Template .claude/skills/init-project
cp -r .governance/Templates/UseCase_Skill_Template .claude/skills/usecases
# … repetir
```

### 2. Uso diario

```bash
# El agente llega y lee su configuración local
# Invoca skills desde su carpeta local
/init-project
/usecases
# … etc
```

### 3. Actualización de framework

```bash
cd .governance
git checkout v0.3.0
cd ..

# Vuelve a copiar los skills
cp -r .governance/Templates/Init_Skill_Template .claude/skills/init-project
# … repetir para todos los skills

# Verifica que AGENT_CONFIG.md siga válido
# (el frontmatter es agnóstico de versión)
```

---

## Reglas

1. **Frontmatter canónico.** Los campos listados (`agente_app`, `version`, `roles_declarados`, etc.) son obligatorios y no cambian su nombre.
2. **Skills precargados, no remotos.** Cada skill es una copia local; no se enlazan.
3. **Configuración local versionada.** `AGENT_CONFIG.md` se commitea al repo junto con el código.
4. **Enriquecimiento sin ruptura.** El implementador puede añadir secciones pero no alteran las canónicas.
5. **Un archivo por herramienta.** Cada agente tiene su propio `AGENT_CONFIG.md`.

---

## Anti-patrones

- ❌ Enlazar skills al framework en vez de copiarlos — rompe la aislación.
- ❌ Hardcodear rutas de skills — declararlas en el frontmatter.
- ❌ Roles no declarados en el frontmatter — la identidad queda implícita.
- ❌ Cambiar el frontmatter canónico — solo el implementador puede enriquecer.
- ❌ No sincronizar skills al actualizar el framework — quedan desactualizados.
- ❌ Un archivo de configuración para todos los agentes — cada uno necesita el suyo.

---

## Relacionado

- [`Agent_Contract_Standard.md`](Agent_Contract_Standard.md) — identidad (`agente_app`, `roles_experto`)
- [`Agent_Roles_And_Lifecycle.md`](Agent_Roles_And_Lifecycle.md) — qué hace cada rol
- [`../00_Governance/Framework_Access_Standard.md`](../00_Governance/Framework_Access_Standard.md) — descubrimiento del framework
- [`../Checklists/New_Project.md`](../Checklists/New_Project.md) — instalación completa
