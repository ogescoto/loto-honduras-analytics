---
id: M-<NNN>
titulo: <nombre de negocio de la meta>
estado: PLANIFICANDO | ACTIVA | EN_VALIDACION | VALIDADA | CERRADA | BLOQUEADA
abierta: <YYYY-MM-DDTHH:MM:SSZ>
cerrada: <YYYY-MM-DDTHH:MM:SSZ | ->
aprobada_por: <usuario | ->
---

> **Estados** (vocabulario cerrado — ver `09_AI/Agent_Roles_And_Lifecycle.md`):
> `PLANIFICANDO` → `ACTIVA` → `EN_VALIDACION` → `VALIDADA` → `CERRADA`.
> Vuelve a `ACTIVA` si el `validator` encuentra defectos o si el usuario rechaza.
> **`CERRADA` solo la pone el usuario**; el `pm` la registra.

# M-<NNN> — <Título de la meta>

## Objetivo

<Qué se quiere lograr, en lenguaje de negocio. Una o dos frases.>

## Alcance

**Incluye:**
- <qué entra>

**No incluye:**
- <qué queda fuera explícitamente>

## Criterios de "hecho" (Done)

La meta se cierra cuando **todos** se cumplen:

- [ ] <criterio verificable 1>
- [ ] <criterio verificable 2>
- [ ] Todas las tareas en `COMPLETE`
- [ ] Sin deuda de mapeo (ninguna tarea cerrada sin pasar por `MAPPED`)

## Especificaciones de origen

| Artefacto | Referencia |
|---|---|
| Casos de uso | <UC-MODULO-NNN, …> |
| Fichas de pantalla | <SCR-MODULO-NNN, …> |
| Módulos afectados | <lista> |

## Tareas

Ver [`00_INDICE.md`](00_INDICE.md).

## Cierre

*Se rellena al cerrar la meta.*

- **Tareas completadas:** <n/n>
- **Iteraciones totales:** <n>
- **Deuda pendiente:** <lista o "ninguna">
- **Destilado a la bóveda por el Experto:** <ADR, notas de módulo, procesos actualizados>
