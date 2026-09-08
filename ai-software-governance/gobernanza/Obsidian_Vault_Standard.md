---
obligation: mandatory
area: documentation
applies_to: all projects
---

# Bóveda Obsidian como Fuente de Verdad

## Principio fundamental
La documentación conceptual y técnica del proyecto reside en una bóveda de Obsidian (carpeta `docs/`, compatible con enlaces wiki). **Es la primera entrada de cualquier agente de IA antes de modificar código.**

El código materializa lo que la bóveda describe. Si hay discrepancia entre el código y la bóveda, es un defecto que debe resolverse, no ignorarse.

## Quién escribe
La bóveda la escribe el subagente **`doc-mapper`** ([`Subagents.md`](Subagents.md)): es el **único escritor** de la documentación curada. Para leer no se necesita nada especial: `doc-reader` (o el propio agente) consulta las notas directamente.

> **Única excepción:** `docs/07_Implementacion/` es la **zona de escritura compartida** donde todos los agentes registran su trabajo (tabla `META | TAREA | ESTADO | FECHA_INI | FECHA_FIN`). Ver [`Activity_Tracking.md`](Activity_Tracking.md). Fuera de esa carpeta, la regla se aplica sin matices.

- Los demás agentes **no escriben** en `docs/` (salvo en `07_Implementacion/`): entregan los cambios a `doc-mapper` para que los documente.
- Prohibición explícita en [`Forbidden_Actions.md`](Forbidden_Actions.md).

## El vault es dinámico (no se hardcodea)
Cada proyecto tiene su bóveda y puede haber muchas. Se **descubre** la bóveda activa:

1. Busca hacia arriba una carpeta con `.obsidian/` → esa es la bóveda.
2. Si no hay `.obsidian/`, usa `docs/` del proyecto.
3. Si no existe, propone crear la estructura estándar (abajo).

Convención por defecto: **`docs/` es el vault del proyecto** y contiene `.obsidian/`.

## Estructura obligatoria del vault

```
docs/
├── .obsidian/                 # Config de Obsidian (marca docs/ como vault)
├── 00_MAPA_DE_CONTENIDOS.md   # Índice navegable con enlaces wiki
├── 00_Proyecto/               # Visión, alcance y contexto global
├── 01_Dominio/                # Lenguaje ubicuo, entidades, casos de uso, glosario
├── 02_Arquitectura/           # ADRs, diagramas, dependencias, contratos API
├── 03_Tecnico/                # Stack, patrones, utilidades globales, Mapa conceptos ↔ código
├── 04_Modulos/                # Una nota por módulo de negocio
├── 05_Procesos/               # Flujos end-to-end
├── 06_UX_UI/                  # Mapas de navegación, mockups, design system
├── 07_Implementacion/         # Registro de ejecución — ZONA DE ESCRITURA COMPARTIDA
└── manual/                    # Fuentes del manual de usuario
```

### Dos zonas con dueños distintos

| Zona | Escribe | Naturaleza |
|---|---|---|
| `00_Proyecto/`, `01_` … `06_`, `manual/` | **Solo `doc-mapper`** | Conocimiento curado: qué **es** el sistema |
| **`07_Implementacion/`** | **Todos los agentes** (append-only) | Registro de ejecución: qué se construye y cuándo |

`07_Implementacion/` lleva la tabla de actividad (ver [`Activity_Tracking.md`](Activity_Tracking.md)). Es la memoria mínima para retomar el trabajo; no es documentación curada.

## Mapa conceptos ↔ código (`03_Tecnico/Mapa_Conceptos_Codigo.md`)

Es la nota que **une los conceptos, componentes y flujos con el código real**, para que `doc-reader` (modelo barato) responda a preguntas del tipo *"si quiero crear un cliente, ¿qué flujo es?"* o *"¿guardo imágenes de un cliente? ¿qué archivos o componentes intervienen y cómo?"* **sin releer el código fuente**.

Lo escribe y actualiza **solo `doc-mapper`** (misma zona curada). Estructura por bloques:

- **Bloque de módulos/componentes:** cada componente de la aplicación → los archivos que lo implementan (`ruta:línea` de la función clave) y su responsabilidad.
- **Bloque de flujos:** cada flujo del sistema (p. ej. "crear cliente", "guardar imagen de cliente") → el orden de pasos y qué archivo/componente interviene en cada paso.
- **Bloque de funcionalidades clave:** cada funcionalidad de negocio → el/los archivo(s) donde vive y cómo se llama (endpoint, función, hook, componente).

Ejemplo de fila de flujo:

```markdown
| Flujo | Pasos | Archivos que intervienen |
|---|---|---|
| Crear cliente | 1. Formulario → 2. Validación → 3. Persistencia | `ui/ClientForm.tsx:12` → `core/validate.ts:30` → `api/clients.post.ts:8` |
```

Reglas del mapa:
1. **Referencias `archivo:línea` reales**, nunca rutas inventadas.
2. Un **concepto sin código** se deja sin asignar y se marca `[SUPUESTO — confirmar]`, no se inventa.
3. Al cambiar código, `doc-mapper` actualiza las filas afectadas al mismo tiempo que la nota del módulo.
4. El mapa no sustituye a las notas de módulo/flujo: las complementa como índice navegable concepto → código.

Plantilla: [`../Templates/Mapa_Conceptos_Template.md`](../Templates/Mapa_Conceptos_Template.md).

## Reglas para agentes de IA

1. **Antes de escribir código** en un módulo, lee su nota en `04_Modulos/` (o consulta a `doc-reader`) para saber dónde está y qué toca. Así gastas el mínimo de contexto.
2. **Después de completar una tarea** que afecte arquitectura, API, modelo de dominio o flujos, **entrega** los archivos modificados y un resumen a `doc-mapper`, que actualiza las notas:
   - Nuevo endpoint → `02_Arquitectura/API.md` o la nota del módulo.
   - Nueva entidad → `01_Dominio/Entidades.md` o su propia nota.
   - Flujo modificado → `05_Procesos/<flujo>.md`.
   - Componente, archivo o funcionalidad nueva → **`03_Tecnico/Mapa_Conceptos_Codigo.md`** (y la nota del módulo).
3. **Módulo nuevo** → `doc-mapper` crea su nota en `04_Modulos/` con [`../Templates/Obsidian_Note_Template.md`](../Templates/Obsidian_Note_Template.md) y la enlaza desde `00_MAPA_DE_CONTENIDOS.md`.
4. **Decisión arquitectónica** → registrar un ADR (ver [`ADR.md`](ADR.md)); lo escribe `doc-mapper`.

> **Preguntas "de flujo" (crear un cliente, guardar imágenes…):** delegar a `doc-reader` (barato). Responde desde el **mapa conceptos ↔ código** sin releer el código fuente. Solo si el mapa no lo cubre, el agente lee el código puntual.

## Convenciones de la bóveda
- **Enlaces wiki:** `[[04_Modulos/Pagos|Pagos]]`.
- **Una nota = un concepto.** Notas atómicas y enlazadas, no documentos monolíticos.
- **Frontmatter** en cada nota (tipo, módulo, fecha, estado).
- **Historial de cambios** al pie de cada nota de módulo.

### Frontmatter de ejemplo

```markdown
---
tipo: modulo
modulo: pagos
estado: activo
actualizado: 2026-06-18
---
```

## Mapa de Contenidos
`00_MAPA_DE_CONTENIDOS.md` es el punto de entrada humano de la bóveda: enlaza secciones y notas clave. Se mantiene actualizado al añadir notas.

## Verificación
La coherencia de la bóveda (enlaces wiki válidos, cada módulo con su nota) la comprueba `doc-mapper` en cada actualización, en Markdown. El **mapa conceptos ↔ código** se verifica igual: toda referencia `archivo:línea` debe existir y apuntar a una función/componente real; si una ruta ya no existe, se actualiza o se marca `[SUPUESTO — confirmar]`.

> Opcional/legado: [`../Tools/check_obsidian_links.py`](../Tools/check_obsidian_links.py) valida enlaces; puede usarse como red de seguridad en CI, pero no es el flujo principal.

## Anti-patrones
- ❌ Escribir directamente en `docs/` fuera de `07_Implementacion/` (solo `doc-mapper`).
- ❌ Usar `07_Implementacion/` como documentación curada: es **registro operativo**.
- ❌ Terminar una tarea sin **entregar** los cambios a `doc-mapper`.
- ❌ Hardcodear la ruta del vault en vez de descubrirlo.
- ❌ Documentación en sitios dispersos en vez de la bóveda.
- ❌ Notas monolíticas de 2000 líneas sin enlaces.
- ❌ `doc-reader` relee el código para responder "flujos" que ya están en el mapa concepts ↔ código.
- ❌ Filas del mapa con rutas inventadas o referencias `archivo:línea` que no existen.

## Relacionado
- [`Subagents.md`](Subagents.md) — `doc-mapper` y `doc-reader`.
- [`Activity_Tracking.md`](Activity_Tracking.md), [`User_Manual_Standard.md`](User_Manual_Standard.md), [`ADR.md`](ADR.md), [`../Templates/Obsidian_Note_Template.md`](../Templates/Obsidian_Note_Template.md), [`../Templates/Mapa_Conceptos_Template.md`](../Templates/Mapa_Conceptos_Template.md)
