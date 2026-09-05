---
template: true
area: documentation
---

# Plantilla: Mapa Conceptos ↔ Código

> **Cómo usar:** `doc-mapper` mantiene esta nota en `docs/03_Tecnico/Mapa_Conceptos_Codigo.md`.
> Une conceptos, componentes y flujos con el código real para que `doc-reader` (modelo barato)
> responda "¿qué flujo es?", "¿qué archivos o componentes intervienen y cómo?" **sin releer el código fuente**.
> Estándar: [`../gobernanza/Obsidian_Vault_Standard.md`](../gobernanza/Obsidian_Vault_Standard.md).

---

```markdown
---
tipo: mapa_conceptos
estado: activo
actualizado: AAAA-MM-DD
---

# Mapa Conceptos ↔ Código

## Componentes

| Componente | Archivos que lo implementan | Responsabilidad |
|---|---|---|
| `<Componente>` | `ruta/archivo.ts:línea` (función clave) | <qué hace en una línea> |
| `<Otro>` | `ruta/archivo.tsx:línea` | <qué hace en una línea> |

## Flujos

| Flujo | Pasos | Archivos que intervienen |
|---|---|---|
| `<Crear cliente>` | 1. <paso> → 2. <paso> → 3. <paso> | `ui/X.tsx:12` → `core/Y.ts:30` → `api/Z.ts:8` |
| `<Guardar imagen de cliente>` | 1. <paso> → 2. <paso> | `ui/A.tsx:5` → `storage/B.ts:22` |

## Funcionalidades clave

| Funcionalidad | Dónde vive | Cómo se llama |
|---|---|---|
| <crear cliente> | `api/clients.post.ts` | `POST /clients` → `createClient()` |
| <subir imagen> | `storage/upload.ts` | `uploadImage()` |

## Historial de cambios

- AAAA-MM-DD: creación inicial.
```

---

## Reglas

- Referencias `archivo:línea` reales, nunca rutas inventadas.
- Concepto sin código asignado → `[SUPUESTO — confirmar]`, no inventar.
- Al cambiar código, `doc-mapper` actualiza las filas afectadas junto con la nota del módulo.

## Relacionado

- [`../gobernanza/Obsidian_Vault_Standard.md`](../gobernanza/Obsidian_Vault_Standard.md) — estándar de la bóveda y el mapa.
- [`../gobernanza/Subagents.md`](../gobernanza/Subagents.md) — `doc-mapper` escribe el mapa; `doc-reader` lo lee.
- [`Obsidian_Note_Template.md`](Obsidian_Note_Template.md) — notas de módulo/entidad.
