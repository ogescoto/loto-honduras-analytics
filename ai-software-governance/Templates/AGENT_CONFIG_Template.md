---
template: true
area: ai-governance
---

# Plantilla: `AGENT_CONFIG.md` (configuración local del agente)

> **Cómo usar:** copia este bloque a `.<herramienta>/AGENT_CONFIG.md` del proyecto.
> Una copia por cada herramienta que trabaje (`.claude/`, `.opencode/`, `.codex/`, etc.).
> Catálogo de subagentes: [`../gobernanza/Subagents.md`](../gobernanza/Subagents.md).

---

```markdown
---
agente_app: <claude-code | opencode | codex | whale | cursor>
version: <v0.1.0>
proyecto: <nombre-del-proyecto>
subagentes: [doc-mapper, doc-reader, dev-backend, dev-frontend, tester, activity-manager]
idioma_respuesta: <idioma del usuario>
modo_cavernicola: true
modo_descubrimiento: local
skills: [<skills del proyecto que esta herramienta puede invocar>]  # opcional
---

# AGENT_CONFIG — <nombre de la herramienta>

## Identidad

- **Aplicación:** `<herramienta>` — el agente_app que va en las bitácoras
- **Versión del agente:** `<v0.1.0>`
- **Proyecto:** `<nombre>`
- **Fecha de instalación:** `<YYYY-MM-DD>`

## Subagentes que ejecuta esta herramienta

Delegas en estos subagentes. Cada uno con scope estricto, contexto aislado y modelo por perfil.

| Subagente | Scope | Modelo | Idioma |
|---|---|---|---|
| `doc-mapper` | Escribe documentación y mapea código → bóveda | pensante | del usuario |
| `doc-reader` | Lee bóveda/código, responde dudas | barato | del usuario |
| `dev-backend` | Backend: lógica, APIs, BD, tests | capaz | del usuario |
| `dev-frontend` | Frontend: componentes, estado, E2E | capaz | del usuario |
| `tester` | Ejecuta la suite, veredicto pasa/falla | barato | del usuario |
| `activity-manager` | Registra META/TAREA/ESTADO/FECHA_INI/FECHA_FIN | barato | del usuario |

> Edita esta tabla según lo que esta herramienta puede ejecutar. Regla de costo: modelo
> capaz solo para escribir; leer, probar y registrar con modelo barato.

## Skills del proyecto (opcional)

Si el proyecto tiene skills instalados (carpeta `skills/`, scripts o comandos), decláralos aquí
**por copia/ruta local, no por enlace al framework**. El framework no aporta skills: solo se
registran los que **ya existen en el proyecto**.

| Skill | Ruta local | Lo invoca | Estado |
|---|---|---|---|
| `<nombre>` | `skills/<nombre>/SKILL.md` | `<subagente>` | `activo` |

> Si el proyecto no tiene skills, **omite el frontmatter `skills`** y esta sección. No inventes
> skills que no existen.

## Reglas de comportamiento

- **Modo cavernícola:** razonamiento interno mínimo (solo conclusiones).
- **Idioma:** responde siempre en el idioma del usuario.
- **Delegación:** contexto aislado; devuelve solo un resumen compacto.

## Configuración específica de <herramienta>

Personalización sin romper el estándar (modelos concretos, límites, integraciones).

```yaml
# ejemplo: asignación de modelos por perfil
modelos:
  barato: <modelo-económico>        # doc-reader, tester, activity-manager
  capaz: <modelo-medio>             # dev-backend, dev-frontend
  pensante: <modelo-capaz>          # doc-mapper
```

## Modo de descubrimiento

Cómo localiza el framework:

- **`local`** — lee `governance_path` de `AGENTS.md`
- **`remoto`** — busca `.governance-root` hacia arriba
- **`híbrido`** — intenta local; si falla, busca remoto

Modo actual: `local`

## Quirks y limitaciones conocidas

| Limitación | Impacto | Workaround |
|---|---|---|
| <…> | <…> | <…> |

## Enriquecimiento personalizado

El implementador puede añadir secciones al final sin alterar las canónicas.
```

---

## Relacionado

- [`../gobernanza/Subagents.md`](../gobernanza/Subagents.md) — catálogo de subagentes.
- [`../Templates/Subagent_Template.md`](Subagent_Template.md) — ficha por subagente.
- [`../Templates/Agent_Contract_Template.md`](Agent_Contract_Template.md) — identidad del agente.
