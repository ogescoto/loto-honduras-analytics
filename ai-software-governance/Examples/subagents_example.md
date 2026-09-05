# Ejemplo: configuración de subagentes con modelos distintos

> Ejemplo **descriptivo** de cómo un proyecto puede declarar los 6 subagentes con modelos
> económicos. Cada herramienta lo traduce a su propio mecanismo de subagentes.

## Asignación de modelos por perfil

| Perfil | Cuándo | Modelos sugeridos (ejemplos) | Subagentes |
|---|---|---|---|
| **barato** | leer, buscar, probar, registrar | un modelo pequeño/rápido | `doc-reader`, `tester`, `activity-manager` |
| **capaz** | escribir código | un modelo medio/bueno en código | `dev-backend`, `dev-frontend` |
| **pensante** | escribir documentación, razonar | el modelo más capaz de razonamiento | `doc-mapper` |

## Fichas (enfoque agnóstico)

```markdown
<!-- .<herramienta>/subagents/doc-reader.md -->
---
name: doc-reader
description: Lee bóveda, código y el mapa conceptos ↔ código; responde dudas de contexto y de flujos con referencias archivo:línea. No escribe.
model: barato
language: es
isolated_context: true
---
```

```markdown
<!-- .<herramienta>/subagents/tester.md -->
---
name: tester
description: Ejecuta la suite del proyecto y devuelve veredicto pasa/falla con lista de tests fallidos. No arregla.
model: barato
language: es
isolated_context: true
---
```

```markdown
<!-- .<herramienta>/subagents/activity-manager.md -->
---
name: activity-manager
description: Mantiene la tabla META/TAREA/ESTADO/FECHA_INI/FECHA_FIN. No asigna trabajo ni crea tareas.
model: barato
language: es
isolated_context: true
---
```

```markdown
<!-- .<herramienta>/subagents/dev-backend.md -->
---
name: dev-backend
description: Implementa backend (lógica, APIs, BD) con sus tests. No ejecuta la suite completa ni autodeclara verde.
model: capaz
language: es
isolated_context: true
---
```

```markdown
<!-- .<herramienta>/subagents/dev-frontend.md -->
---
name: dev-frontend
description: Implementa frontend (componentes, estado, E2E). No toca backend.
model: capaz
language: es
isolated_context: true
---
```

```markdown
<!-- .<herramienta>/subagents/doc-mapper.md -->
---
name: doc-mapper
description: Escribe y actualiza documentación, mapea código funcional (tests en verde) a la bóveda y mantiene el mapa conceptos ↔ código.
model: pensante
language: es
isolated_context: true
---
```

## Notas

- **`isolated_context: true`** es lo que evita consumir el contexto del agente principal: cada subagente arranca limpio y devuelve un resumen compacto.
- **`language`** fija el idioma de respuesta: cada subagente responde en el idioma del usuario, no en el de su modelo.
- **`model`** es el perfil de costo; reemplaza por el identificador concreto del modelo de tu herramienta.
- **Modo cavernícola** (razonamiento interno mínimo) se declara en el encargo o en el contrato del agente: ver [`../gobernanza/Subagents.md`](../gobernanza/Subagents.md).
