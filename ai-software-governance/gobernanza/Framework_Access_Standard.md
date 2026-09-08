---
obligation: mandatory
area: governance
applies_to: all projects
---

# Acceso al Framework (descubrimiento dinámico y versionado)

## Propósito
Definir **cómo un agente localiza el framework** sin conocer su ruta de antemano, y **cómo un proyecto se ancla a una versión** concreta de las reglas.

Resuelve un problema real: la ruta del framework **cambia según cómo se incorpore**, y una ruta incrustada en las instrucciones falla en cuanto la realidad varía.

| Forma de incorporación | Ruta real |
|---|---|
| Submódulo en `.governance/` | `.governance/` |
| Copia dentro del proyecto | `.governance/` o `vendor/governance/` |
| Framework hermano (compartido por varios proyectos) | `../ai-software-governance/` |
| Paquete npm (opcional) | `node_modules/@scope/ai-software-governance/` |

Ninguna ruta literal sirve para todas. Por eso **la ruta no se hardcodea: se descubre**.

> Este es el mismo principio que [`Obsidian_Vault_Standard.md`](Obsidian_Vault_Standard.md) aplica a la bóveda ("el vault es dinámico"). Aquí se aplica al framework sobre sí mismo.

---

## El marcador: `.governance-root`

La raíz del framework contiene un archivo `.governance-root`. **Su presencia es lo que identifica la carpeta**, igual que `.obsidian/` identifica un vault.

```yaml
framework: ai-software-governance
version: 1.0.0
entrypoint: AI_START_HERE.md
index: INDEX.md
policy_index: gobernanza/Policy_Index.md
```

Nunca se borra ni se mueve. Sin él, el descubrimiento falla.

---

## Algoritmo de descubrimiento (en este orden)

1. **`AGENTS.md` del proyecto declara `governance_path`** en su frontmatter → esa es la ruta. **Camino normal y preferente.**
2. Si no está declarada, **buscar hacia arriba** desde el directorio de trabajo una carpeta que contenga `.governance-root`. Cubre tanto el submódulo dentro del proyecto como el framework hermano en el nivel superior.
3. Si no aparece, probar las ubicaciones convencionales: `.governance/`, `../ai-software-governance/`, `node_modules/@*/ai-software-governance/`.
4. Si sigue sin aparecer, **detenerse y preguntar al humano**. No improvisar reglas ni continuar sin gobernanza.

Una vez localizada la raíz, **todas las referencias son relativas a ella**: `<raíz>/AI_START_HERE.md`, `<raíz>/gobernanza/Agent_Workflow.md`. Nunca rutas absolutas del proyecto.

---

## Formas de incorporación

| Modo | Cuándo usarlo | Versión fijable | Requiere |
|---|---|---|---|
| **Submódulo Git** (recomendado) | Caso general | **Sí** (tag/commit) | Git |
| **Copia (vendoring)** | Sin acceso a Git remoto, o congelar sin submódulos | Sí (manual) | — |
| **Framework hermano** | Varios proyectos propios en un mismo árbol | No (siempre la actual) | — |
| **Paquete npm/pnpm** | Proyectos Node que ya usan el gestor | Sí (SemVer) | Node |

**El submódulo es el modo recomendado por defecto:** no duplica archivos, permite anclar a una versión y **no impone ninguna dependencia de stack** — el framework gobierna proyectos Node, Python, Go o repos de solo documentación por igual.

```bash
git submodule add https://github.com/<org>/ai-software-governance .governance
cd .governance && git checkout v1.0.0        # anclar a una versión
```

Al clonar el proyecto: `git clone --recurse-submodules`, o `git submodule update --init` si ya se clonó.

> **El modo de entrega es intercambiable; el contrato no.** El contrato es `.governance-root` + el algoritmo de descubrimiento. Cambiar de submódulo a paquete no obliga a tocar ninguna regla.

---

## Versionado y anclaje

El framework sigue SemVer (ver [`../CHANGELOG.md`](../CHANGELOG.md)):

| Incremento | Significa |
|---|---|
| **MAJOR** | Cambio **incompatible** en una política `mandatory`/`standard` |
| **MINOR** | Política o documento nuevo, compatible |
| **PATCH** | Correcciones, aclaraciones, ejemplos |

### Regla: ADR ⇒ MAJOR

[`ADR.md`](ADR.md) y [`../GOVERNANCE.md`](../GOVERNANCE.md) exigen un ADR para cambiar una política `mandatory`/`standard`.

> **Todo cambio que exija ADR y altere o retire una regla existente es MAJOR.** Añadir una política nueva sin tocar las existentes es MINOR.

Esto ata el proceso de decisión al versionado: si rompió, la versión lo dice.

### Anclaje por proyecto

Cada proyecto se ancla a un **tag**, no a una rama. Anclar a `main` equivale a no tener versión: el proyecto recibe cambios sin decidirlo, incluso a mitad de una entrega.

```bash
cd .governance
git fetch --tags
git checkout v1.1.0        # migración explícita y deliberada
```

Antes de subir de MAJOR, consulta `MIGRATION.md` de esa versión ([`../MIGRATION.md`](../MIGRATION.md) para v1.0.0).

---

## Los subagentes se configuran por copia

Los subagentes del catálogo (ver [`Subagents.md`](Subagents.md)) se **replican** en la configuración de cada herramienta (`.<herramienta>/`), a partir de las plantillas del framework ([`../Templates/Subagent_Template.md`](../Templates/Subagent_Template.md), [`../Templates/AGENT_CONFIG_Template.md`](../Templates/AGENT_CONFIG_Template.md)); **no se enlazan** al framework.

Razón: un subagente es **ejecutable**. Si cambia bajo los pies de un agente a mitad de tarea, el comportamiento cambia sin aviso. La copia da control sobre **cuándo** se adopta la mejora — la misma lógica que un lockfile.

Se re-sincronizan explícitamente al migrar de versión del framework.

---

## Responsabilidades

| Quién | Qué |
|---|---|
| **Humano que adopta** | Elige el modo, ancla a un tag, declara `governance_path` en `AGENTS.md` |
| **Agente** | Descubre la raíz con el algoritmo; si no la encuentra, **se detiene y pregunta** |
| **Framework** | Mantiene `.governance-root` con su versión y publica un tag por release |

---

## Anti-patrones

- ❌ Hardcodear la ruta del framework en instrucciones o skills (`.governance/ai-software-governance/...`).
- ❌ Anclar un proyecto a `main` en vez de a un tag.
- ❌ Publicar un cambio que rompe una política sin subir MAJOR y sin ADR.
- ❌ Borrar o mover `.governance-root`.
- ❌ Enlazar los subagentes al framework en vez de replicarlos por copia.
- ❌ Que un agente continúe trabajando sin haber localizado el framework.
- ❌ Hacer que el framework dependa de un gestor de paquetes concreto — rompería su agnosticismo de stack.

## Relacionado
- [`../GOVERNANCE.md`](../GOVERNANCE.md), [`../CHANGELOG.md`](../CHANGELOG.md), [`../MIGRATION.md`](../MIGRATION.md), [`ADR.md`](ADR.md), [`Obsidian_Vault_Standard.md`](Obsidian_Vault_Standard.md), [`../Templates/AGENTS_Template.md`](../Templates/AGENTS_Template.md), [`../Checklists/New_Project.md`](../Checklists/New_Project.md)
