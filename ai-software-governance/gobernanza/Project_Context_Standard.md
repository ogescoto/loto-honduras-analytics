---
obligation: mandatory
area: governance
applies_to: all projects
---

# Contexto del Proyecto (`AGENTS.md` y `docs/00_Proyecto/`)

## Propósito
Definir **dónde vive la intención del proyecto** —qué se construye y para qué— y **cuál es el punto de entrada único** para cualquier agente, sea cual sea su herramienta.

Resuelve dos huecos:
- **Nada capturaba la intención del usuario.** El framework tenía reglas genéricas y registro de ejecución, pero ningún sitio donde constara *por qué existe este proyecto y qué debe lograr*.
- **El punto de entrada estaba atado a una herramienta.** `CLAUDE.md` solo lo lee Claude Code; Cursor busca `.cursorrules`, Copilot busca lo suyo. Mantener copias sincronizadas garantiza divergencia.

---

## `AGENTS.md` — punto de entrada único

En la **raíz del proyecto**. Es el primer archivo que lee cualquier agente, de cualquier herramienta.

Los archivos específicos de cada herramienta (`CLAUDE.md`, `.cursorrules`, `.github/copilot-instructions.md`) pasan a ser **punteros de una línea**:

```markdown
# CLAUDE.md
Lee `AGENTS.md` en la raíz. Es el punto de entrada único para todos los agentes.
```

Una sola fuente, varios alias. `AGENTS.md` es además la convención que la industria está adoptando para instrucciones multi-herramienta.

### Qué contiene (corto: redirige, no duplica)

```yaml
---
governance_path: .governance      # ruta al framework — ver Framework_Access_Standard.md
governance_version: v1.0.0        # tag al que está anclado el proyecto
---
```

Y en el cuerpo: qué es el proyecto en dos frases, las reglas no negociables, la ruta de entrada al framework, y dónde está el contexto completo. **No repite las reglas del framework**: apunta a ellas.

Plantilla: [`../Templates/AGENTS_Template.md`](../Templates/AGENTS_Template.md).

---

## `docs/00_Proyecto/` — la intención

Tres archivos dentro de la bóveda. Los escribe **`doc-mapper`** (es conocimiento curado, sin excepción a la regla del único escritor).

| Archivo | Responde | Ritmo de cambio |
|---|---|---|
| `VISION.md` | ¿Por qué existe? ¿Para quién? ¿Qué problema resuelve? ¿Qué **no** es? | Casi nunca |
| `ALCANCE.md` | ¿Qué entra en esta versión y qué queda **explícitamente** fuera? | Por versión |
| `CONTEXTO_GLOBAL.md` | Estado vivo: stack, módulos existentes, integraciones, decisiones vigentes | Continuamente |

### Por qué tres archivos y no uno

Ritmos distintos. La **visión** es estable y un agente la lee una vez para entender el porqué; el **contexto global** cambia con cada módulo y se consulta constantemente. Mezclarlos hace que lo estable se pierda entre el ruido operativo.

El **alcance** existe aparte porque su valor está en lo que declara **fuera**: es lo que evita que un agente "mejore" el proyecto con algo que se decidió no hacer.

### Origen: la intención del usuario

`docs/00_Proyecto/` se genera **entrevistando al usuario** al arrancar el proyecto, no inventándolo. Si un agente no tiene la información, **pregunta**; no rellena con supuestos. Lo no confirmado se marca `[SUPUESTO — confirmar]`.

> `00_` no colisiona con `00_MAPA_DE_CONTENIDOS.md`: ese es un **archivo**, esto es una **carpeta**.

---

## Orden de lectura de un agente

Cinco lecturas cortas. Las tres primeras son del proyecto; las dos últimas, genéricas del framework:

| # | Archivo | Responde |
|---|---|---|
| 1 | `AGENTS.md` | ¿Dónde estoy y qué no puedo hacer? |
| 2 | `.<mi-agente>/AGENT_CONTEXT.md` | ¿Quién soy, cómo me firmo, qué puedo tomar? |
| 3 | `docs/00_Proyecto/CONTEXTO_GLOBAL.md` | ¿Qué es este sistema hoy? |
| 4 | `docs/07_Implementacion/ACTIVIDAD.md` | ¿Qué hay en curso y qué me toca? |
| 5 | `<framework>/AI_START_HERE.md` | ¿Cuáles son las reglas? |

El paso 2 lo define [`Agent_Contract_Standard.md`](Agent_Contract_Standard.md); el 4, [`Activity_Tracking.md`](Activity_Tracking.md). Si el proyecto no tiene `docs/00_Proyecto/`, activa la [`Project_Start.md`](Project_Start.md) (asistencia inicial).

---

## Estructura resultante

```
mi-proyecto/
├── AGENTS.md                    ← punto de entrada único (normativo)
├── CLAUDE.md                    ← puntero de una línea
├── .cursorrules                 ← puntero de una línea
├── .aicodeprotect.yml
├── .governance/                 ← el framework (submódulo anclado a un tag)
├── .claude/
│   ├── AGENT_CONTEXT.md         ← contrato de esta herramienta
│   └── AGENT_CONFIG.md          ← configuración local (subagentes, modelos)
├── .opencode/AGENT_CONTEXT.md
└── docs/
    ├── 00_Proyecto/             ← VISION · ALCANCE · CONTEXTO_GLOBAL
    ├── 00_MAPA_DE_CONTENIDOS.md
    ├── 01_Dominio/ … 06_UX_UI/
    ├── 07_Implementacion/       ← ACTIVIDAD.md (zona de escritura compartida)
    └── manual/
```

Si el proyecto no tiene `docs/00_Proyecto/`, el arranque es la **asistencia inicial**
(`Project_Start.md`): el agente entrevista al usuario y produce `VISION` + `ALCANCE` +
`CONTEXTO_GLOBAL` + la primera `ACTIVIDAD.md`. No existe `INIT.md` ni `ONBOARDING.md` como
artefactos de arranque en el modelo actual.

---

## Anti-patrones

- ❌ Duplicar las reglas del framework dentro de `AGENTS.md` (se desincronizan).
- ❌ Mantener varios archivos de entrada con contenido real en vez de punteros.
- ❌ Hardcodear la ruta del framework en vez de declararla en `governance_path`.
- ❌ Anclar `governance_version` a una rama en lugar de a un tag.
- ❌ Inventar la visión o el alcance en vez de preguntar al usuario.
- ❌ Escribir en `docs/00_Proyecto/` sin ser `doc-mapper`.
- ❌ Un `ALCANCE.md` sin sección de "qué queda fuera" — ahí está su valor.
- ❌ Empezar a codificar sin `docs/00_Proyecto/` (nadie sabe para qué se construye).

## Relacionado
- [`Framework_Access_Standard.md`](Framework_Access_Standard.md), [`Project_Start.md`](Project_Start.md), [`Agent_Contract_Standard.md`](Agent_Contract_Standard.md), [`Activity_Tracking.md`](Activity_Tracking.md), [`Obsidian_Vault_Standard.md`](Obsidian_Vault_Standard.md), [`../Templates/AGENTS_Template.md`](../Templates/AGENTS_Template.md), [`../Templates/Project_Context_Template/`](../Templates/Project_Context_Template/)
