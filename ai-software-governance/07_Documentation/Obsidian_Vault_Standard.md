---
obligation: mandatory
area: documentation
applies_to: all projects
---

# Bóveda Obsidian como Fuente de Verdad

## Principio fundamental
La documentación conceptual y técnica del proyecto reside en una bóveda de Obsidian (carpeta `docs/` del proyecto, compatible con enlaces wiki). **Es la primera entrada de cualquier agente de IA antes de modificar código.**

El código materializa lo que la bóveda describe. Si hay discrepancia entre el código y la bóveda, es un defecto que debe resolverse, no ignorarse.

## Único escritor: el Experto Obsidian
La bóveda tiene **un solo dueño con permiso de escritura**: el **Experto Obsidian** (skill `/obsidian`). Ver [`../09_AI/Documentation_Expert.md`](../09_AI/Documentation_Expert.md).

- Los demás agentes **no escriben** en `docs/`. **Consultan** al experto antes de trabajar y le **entregan** los cambios después para que él actualice.
- Esto mantiene la coherencia de la fuente de verdad y reduce el contexto que gastan los agentes desarrolladores/diseñadores.
- Prohibición explícita en [`../09_AI/Forbidden_Actions.md`](../09_AI/Forbidden_Actions.md).

## El vault es dinámico (no se hardcodea)
No hay una ruta absoluta fija ni un vault único: **cada proyecto tiene su bóveda** y puede haber muchas. El experto **descubre** la bóveda activa:

1. Busca hacia arriba una carpeta con `.obsidian/` → esa es la bóveda.
2. Si no hay `.obsidian/`, usa `docs/` del proyecto.
3. Si no existe, propone crear la estructura estándar (abajo).

Convención por defecto: **`docs/` es el vault del proyecto** y contiene la carpeta `.obsidian/` (config de Obsidian), de modo que `docs/` se abre directamente como bóveda en la app.

## Estructura obligatoria del vault
Cada proyecto mantiene esta estructura dentro de `docs/`:

```
docs/
├── .obsidian/                 # Config de Obsidian (marca docs/ como vault)
├── 00_MAPA_DE_CONTENIDOS.md   # Índice navegable con enlaces wiki
├── 01_Dominio/                # Lenguaje ubicuo, entidades, casos de uso, glosario
├── 02_Arquitectura/           # ADRs, diagramas C4, dependencias, contratos API
├── 03_Tecnico/                # Stack, patrones, utilidades globales
├── 04_Modulos/                # Una nota por módulo de negocio (p.ej. Pagos.md)
├── 05_Procesos/               # Flujos end-to-end, secuencias de interacción
├── 06_UX_UI/                  # Mapas de navegación, mockups, design system
└── manual/                    # Fuentes del manual de usuario (ver User_Manual_Standard.md)
```

## Reglas para agentes de IA (Mandatory)

> El acceso a la bóveda pasa por el **Experto Obsidian** (`/obsidian`). Los agentes no leen toda la bóveda ni la escriben directamente.

1. **Antes de escribir código** en un módulo, el agente DEBE **consultar al Experto Obsidian** (`/obsidian <pregunta>`) para obtener: dónde está, qué entender y qué notas son relevantes (nota del módulo en `04_Modulos/`, flujos en `05_Procesos/`, etc.). Así gasta el mínimo de contexto.

2. **Después de completar una tarea** que afecte arquitectura, API, modelo de dominio o flujos de negocio, el agente DEBE **entregar al Experto Obsidian** la lista de archivos modificados y un resumen (`/obsidian update <archivos> -- <resumen>`). El experto actualiza las notas correspondientes:
   - Nuevo endpoint → `02_Arquitectura/API.md` o la nota del módulo.
   - Nueva entidad → `01_Dominio/Entidades.md` o su propia nota.
   - Flujo modificado → `05_Procesos/<flujo>.md`.

3. **Módulo nuevo** → el experto crea su nota en `04_Modulos/` con [`../Templates/Obsidian_Note_Template.md`](../Templates/Obsidian_Note_Template.md) y la enlaza desde `00_MAPA_DE_CONTENIDOS.md`.

4. **Decisión arquitectónica** → registrar un ADR (ver [`ADR.md`](ADR.md)); lo escribe el experto.

## Convenciones de la bóveda
- **Enlaces wiki:** `[[04_Modulos/Pagos|Pagos]]` para navegar entre notas.
- **Una nota = un concepto.** Notas atómicas y enlazadas, no documentos monolíticos.
- **Frontmatter** en cada nota (tipo, módulo, fecha de actualización, estado).
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
`00_MAPA_DE_CONTENIDOS.md` es el punto de entrada humano de la bóveda: enlaza a las secciones y a las notas clave. Se mantiene actualizado al añadir notas.

## Verificación
La coherencia de la bóveda (enlaces wiki válidos, cada módulo con su nota) es responsabilidad del **Experto Obsidian** en cada actualización, en Markdown.

> Opcional/legado: existe un script [`../Tools/check_obsidian_links.py`](../Tools/check_obsidian_links.py) que valida enlaces y notas de módulo; puede usarse como red de seguridad en CI, pero **no es el flujo principal**. La fuente de verdad la mantiene el experto.

## Anti-patrones
- ❌ Que un agente desarrollador/diseñador **escriba directamente** en `docs/` (solo el experto).
- ❌ Trabajar sin **consultar** antes al experto.
- ❌ Terminar una tarea sin **entregar** los cambios al experto.
- ❌ Hardcodear la ruta del vault en vez de descubrirlo.
- ❌ Documentación en sitios dispersos (wikis externas, comentarios sueltos) en vez de la bóveda.
- ❌ Notas monolíticas de 2000 líneas sin enlaces.

## Relacionado
- [`../09_AI/Documentation_Expert.md`](../09_AI/Documentation_Expert.md), [`User_Manual_Standard.md`](User_Manual_Standard.md), [`ADR.md`](ADR.md), [`../Templates/Obsidian_Note_Template.md`](../Templates/Obsidian_Note_Template.md), [`../Templates/Obsidian_Skill_Template/SKILL.md`](../Templates/Obsidian_Skill_Template/SKILL.md)
